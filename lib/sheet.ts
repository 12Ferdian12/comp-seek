import Papa from 'papaparse';
import type { Competition, SheetCategory } from './types';

const BASE_URL = 'https://docs.google.com/spreadsheets/d/1xq0oASCqNLyXxE5-GaqQp4ZQgPhhRrtDIZLhtldu-70/export?format=csv';

const SHEET_ORDER: readonly SheetCategory[] = [
  'CS-Competition',
  'CSxEE-Competition',
  'Paper-Competition',
];

const PLACEHOLDER_TEXT_PATTERN =
  /^(-+|—|n\/a|none|unknown|tidak ditemukan|unspecified|not specified|tba)$/i;

const GENERIC_LOCATIONS = new Set([
  'Online / Global',
  'Global',
  'Online / In-person',
]);

export const SHEET_CONFIG: { category: SheetCategory; gid: string; label: string; desc: string }[] = [
  {
    category: 'CS-Competition',
    gid: '0',
    label: 'CS-Competition',
    desc: 'Programming, AI/ML, Hackathon, CTF & Software Engineering',
  },
  {
    category: 'CSxEE-Competition',
    gid: '232877020',
    label: 'CSxEE-Competition',
    desc: 'Robotics, Embedded Systems, IoT, Hardware & Multi-disciplinary',
  },
  {
    category: 'Paper-Competition',
    gid: '2117962469',
    label: 'Paper Competition',
    desc: 'Student Research, Academic Paper & Conference Paper Tracks',
  },
];

export function cleanText(raw?: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed || PLACEHOLDER_TEXT_PATTERN.test(trimmed)) return '';
  return trimmed;
}

export function sanitizeRating(raw?: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed || cleanText(trimmed) === '') return '';

  // Recover ratings auto-converted by Google Sheets into 5-digit date serials (e.g. 4/5 -> 46117).
  if (/^\d{5}$/.test(trimmed)) {
    const serial = Number(trimmed);
    if (serial >= 40000 && serial <= 55000) {
      const date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      if (day === 5 && month >= 1 && month <= 5) return `${month}/5`;
      if (month === 5 && day >= 1 && day <= 5) return `${day}/5`;
    }
    return '';
  }

  const normalized = trimmed.replace(/\s+(?:out\s+)?of\s+/i, '/');
  const ratioMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (ratioMatch) {
    const x = Number(ratioMatch[1]);
    const y = Number(ratioMatch[2]);
    if (Number.isFinite(x) && Number.isFinite(y) && x > 0 && x <= y && y <= 100) {
      return `${ratioMatch[1]}/${ratioMatch[2]}`;
    }
    return '';
  }

  const bareMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
  if (bareMatch) {
    const n = Number(bareMatch[1]);
    if (Number.isFinite(n) && n > 0 && n <= 5) {
      return `${trimmed}/5`;
    }
  }

  return '';
}

export function slugifyCompetitionId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `comp-${slug || 'untitled'}`;
}

// shortcut: ISO dates only (all three sheets use ISO today); add formats if sheet data changes.
export function normalizeDate(raw: string): string {
  return raw.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? '';
}

export function normalizeStatus(raw: string): 'Open' | 'Upcoming' | 'Closed' {
  const s = (raw || '').toLowerCase().trim();
  if (!s) return 'Upcoming';
  if (s.includes('closed') || s.includes('ended') || s.includes('past')) return 'Closed';
  if (s.includes('upcoming') || s.includes('soon') || s.includes('opening')) return 'Upcoming';
  if (s.includes('open') || s.includes('accepting') || s.includes('underway')) return 'Open';
  return 'Open';
}

function normalizeTeamFormat(raw: string): string {
  const value = raw.trim();
  if (/individual\s*\/\s*team|individual\s+or\s+team|solo.*team|team.*solo/i.test(value)) return 'Individual / Team';
  if (/individual|solo|perseorangan/i.test(value)) return 'Individual';
  if (/team|tim/i.test(value)) return 'Team';
  return '';
}

function statusRank(status: Competition['status']): number {
  if (status === 'Open') return 3;
  if (status === 'Upcoming') return 2;
  return 1;
}

export function deduplicateCompetitions(items: Competition[]): Competition[] {
  const byTitle = new Map<string, Competition>();

  for (const rawItem of items) {
    if (rawItem.status === 'Closed') continue;

    const itemCategories = rawItem.sheetCategories?.length
      ? rawItem.sheetCategories
      : [rawItem.sheetCategory];

    const key = rawItem.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const existing = byTitle.get(key);

    if (!existing) {
      byTitle.set(key, {
        ...rawItem,
        sheetCategories: SHEET_ORDER.filter((cat) => itemCategories.includes(cat)),
      });
      continue;
    }

    const combinedCats = new Set<SheetCategory>([
      ...existing.sheetCategories,
      ...itemCategories,
    ]);
    existing.sheetCategories = SHEET_ORDER.filter((cat) => combinedCats.has(cat));

    const existingField = cleanText(existing.field);
    const incomingField = cleanText(rawItem.field);
    if (existingField && incomingField && existingField !== incomingField) {
      existing.field = 'Both';
    } else if (!existingField && incomingField) {
      existing.field = incomingField;
    }

    if (statusRank(rawItem.status) > statusRank(existing.status)) {
      existing.status = rawItem.status;
      if (rawItem.rawStatus) existing.rawStatus = rawItem.rawStatus;
    }

    if (!existing.deadlineDate && rawItem.deadlineDate) {
      existing.deadlineDate = rawItem.deadlineDate;
      existing.deadline = rawItem.deadline || existing.deadline;
    } else if (!existing.deadline && rawItem.deadline) {
      existing.deadline = rawItem.deadline;
    }

    if (
      (!existing.fee || existing.fee === 'Free / Unspecified') &&
      rawItem.fee &&
      rawItem.fee !== 'Free / Unspecified'
    ) {
      existing.fee = rawItem.fee;
    }

    if (
      !existing.location ||
      (GENERIC_LOCATIONS.has(existing.location) &&
        rawItem.location &&
        !GENERIC_LOCATIONS.has(rawItem.location))
    ) {
      existing.location = rawItem.location;
    }

    existing.organizer = existing.organizer || rawItem.organizer;
    existing.year = existing.year || rawItem.year;
    existing.type = existing.type || rawItem.type;
    existing.eligibility = existing.eligibility || rawItem.eligibility;
    existing.teamFormat = existing.teamFormat || rawItem.teamFormat;
    existing.teamSize = existing.teamSize || rawItem.teamSize;
    existing.rating = existing.rating || rawItem.rating;
    existing.regOpen = existing.regOpen || rawItem.regOpen;
    existing.eventDate = existing.eventDate || rawItem.eventDate;
    existing.topics = existing.topics || rawItem.topics;
    existing.description = existing.description || rawItem.description;
    existing.requirements = existing.requirements || rawItem.requirements;
    existing.prize = existing.prize || rawItem.prize;
    existing.officialUrl = existing.officialUrl || rawItem.officialUrl;
    existing.regUrl = existing.regUrl || rawItem.regUrl;
    existing.notes = existing.notes || rawItem.notes;
    existing.lastVerified = existing.lastVerified || rawItem.lastVerified;
  }

  const seenIds = new Map<string, number>();
  return Array.from(byTitle.values()).map((comp) => {
    const baseId = slugifyCompetitionId(comp.name);
    const count = (seenIds.get(baseId) ?? 0) + 1;
    seenIds.set(baseId, count);
    return {
      ...comp,
      id: count === 1 ? baseId : `${baseId}-${count}`,
    };
  });
}

async function fetchSheetCsv(gid: string): Promise<Record<string, string>[]> {
  const res = await fetch(`${BASE_URL}&gid=${gid}`, {
    next: { revalidate: 3600, tags: ['competitions'] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch spreadsheet gid ${gid}: ${res.statusText}`);
  }

  const csvText = await res.text();
  const { data } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
  });

  return data;
}

export async function getCompetitions(): Promise<Competition[]> {
  const [csRows, csxeeRows, paperRows] = await Promise.all([
    fetchSheetCsv('0'),
    fetchSheetCsv('232877020'),
    fetchSheetCsv('2117962469'),
  ]);

  const competitions: Competition[] = [];

  // 1. Parse CS-Competition (gid=0)
  csRows.forEach((row) => {
    const name = row['Competition Name']?.trim();
    if (!name) return;

    const organizer = cleanText(row['Organizer']);
    const rawStatus = row['Status']?.trim() || '';
    const location = [cleanText(row['Location']), cleanText(row['Mode'])].filter(Boolean).join(' • ') || 'Online / Global';
    const description = cleanText(row['Description']);

    competitions.push({
      id: slugifyCompetitionId(name),
      sheetCategory: 'CS-Competition',
      sheetCategories: ['CS-Competition'],
      name,
      organizer,
      category: cleanText(row['Category']) || 'Computer Science / Programming',
      field: 'Informatika',
      type: cleanText(row['Category']) || 'Coding Contest',
      eligibility: cleanText(row['Target Participants']) || 'Mahasiswa / Umum',
      teamFormat: normalizeTeamFormat(row['Team Format'] || row['Individual / Team'] || row['Target Participants'] || ''),
      deadline: cleanText(row['Registration Deadline']),
      deadlineDate: normalizeDate(row['Registration Deadline'] || ''),
      regOpen: cleanText(row['Registration Open']),
      eventDate: cleanText(row['Event Date']),
      description,
      topics: description || cleanText(row['Category']),
      requirements: cleanText(row['Submission Requirements'] || row['Requirements']),
      location,
      prize: cleanText(row['Prize']),
      fee: cleanText(row['Registration Fee']) || 'Free / Unspecified',
      rating: sanitizeRating(row['Rating'] || row['Relevance Score']),
      officialUrl: cleanText(row['Source Link']),
      regUrl: cleanText(row['Registration Link']) || cleanText(row['Source Link']),
      status: normalizeStatus(rawStatus),
      rawStatus,
      notes: cleanText(row['Notes']),
      lastVerified: cleanText(row['Last Updated']),
    });
  });

  // 2. Parse CSxEE-Competition (gid=232877020)
  csxeeRows.forEach((row) => {
    const name = row['Competition Name']?.trim();
    if (!name) return;

    const organizer = cleanText(row['Organizer']);
    const rawStatus = row['Registration Status']?.trim() || '';
    const location = [cleanText(row['Location']), cleanText(row['Country'])].filter(Boolean).join(', ') || 'Global';
    const relevance = cleanText(row['CS × EE Relevance']);

    competitions.push({
      id: slugifyCompetitionId(name),
      sheetCategory: 'CSxEE-Competition',
      sheetCategories: ['CSxEE-Competition'],
      name,
      organizer,
      category: cleanText(row['Category']) || 'Embedded / Robotics / CSxEE',
      field: 'Both',
      type: cleanText(row['Competition Type']) || 'Hardware & Software Contest',
      eligibility: cleanText(row['Eligibility']),
      teamFormat: normalizeTeamFormat(row['Team Format'] || row['Individual / Team'] || row['Eligibility'] || ''),
      deadline: cleanText(row['Registration Deadline']),
      deadlineDate: normalizeDate(row['Registration Deadline'] || ''),
      regOpen: cleanText(row['Registration Start']),
      eventDate: cleanText(row['Competition Date']),
      description: relevance,
      topics: relevance || cleanText(row['Category']),
      requirements: cleanText(row['Submission Requirements'] || row['Requirements']),
      location,
      prize: cleanText(row['Prize']),
      fee: cleanText(row['Registration Fee']) || 'Free / Unspecified',
      rating: sanitizeRating(row['Rating'] || row['Relevance Score']),
      officialUrl: cleanText(row['Official Website'] || row['Source URL']),
      regUrl: cleanText(row['Official Website'] || row['Source URL']),
      status: normalizeStatus(rawStatus),
      rawStatus,
      notes: cleanText(row['Notes']),
      lastVerified: cleanText(row['Last Verified'] || row['Date Found']),
    });
  });

  // 3. Parse Paper-Competition (gid=2117962469)
  paperRows.forEach((row) => {
    const name = row['Competition Name']?.trim();
    if (!name) return;

    const organizer = cleanText(row['Organizer']);
    const rawStatus = row['Registration Status']?.trim() || '';

    competitions.push({
      id: slugifyCompetitionId(name),
      sheetCategory: 'Paper-Competition',
      sheetCategories: ['Paper-Competition'],
      name,
      organizer,
      category: 'Paper & Research Competition',
      year: cleanText(row['Edition / Year']),
      field: cleanText(row['Field — Elektro / Informatika / Both']) || 'Both',
      type: cleanText(row['Competition Type']) || 'Student Paper Competition',
      eligibility: cleanText(row['Eligibility']),
      teamFormat: normalizeTeamFormat(row['Individual / Team'] || '') || cleanText(row['Individual / Team']),
      teamSize: cleanText(row['Team Size']),
      regOpen: cleanText(row['Registration Opening Date']),
      deadline: cleanText(row['Paper Submission Deadline']),
      deadlineDate: normalizeDate(row['Paper Submission Deadline'] || ''),
      eventDate: cleanText(row['Event Date']),
      topics: cleanText(row['Theme / Research Topics']),
      requirements: cleanText(row['Submission Requirements']),
      location: cleanText(row['Location / Format']) || 'Online / In-person',
      prize: cleanText(row['Prize / Awards']),
      fee: cleanText(row['Registration Fee']) || 'Free / Unspecified',
      rating: sanitizeRating(row['Rating'] || row['Relevance Score']),
      officialUrl: cleanText(row['Official Website']),
      regUrl: cleanText(row['Registration Link']),
      status: normalizeStatus(rawStatus),
      rawStatus,
      notes: cleanText(row['Notes']),
      lastVerified: cleanText(row['Last Verified']),
    });
  });

  return deduplicateCompetitions(competitions);
}
