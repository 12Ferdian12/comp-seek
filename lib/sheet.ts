import Papa from 'papaparse';
import { Competition, SheetCategory } from './types';

const BASE_URL = 'https://docs.google.com/spreadsheets/d/1xq0oASCqNLyXxE5-GaqQp4ZQgPhhRrtDIZLhtldu-70/export?format=csv';

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

function normalizeStatus(raw: string): 'Open' | 'Upcoming' | 'Closed' {
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
  csRows.forEach((row, idx) => {
    const name = row['Competition Name']?.trim();
    if (!name) return;

    const organizer = row['Organizer']?.trim() || '';
    const rawStatus = row['Status']?.trim() || '';
    const location = [row['Location']?.trim(), row['Mode']?.trim()].filter(Boolean).join(' • ') || 'Online / Global';

    competitions.push({
      id: `cs-${idx}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}`,
      sheetCategory: 'CS-Competition',
      name,
      organizer,
      category: row['Category']?.trim() || 'Computer Science / Programming',
      field: 'Informatika',
      type: row['Category']?.trim() || 'Coding Contest',
      eligibility: row['Target Participants']?.trim() || 'Mahasiswa / Umum',
      teamFormat: normalizeTeamFormat(row['Team Format'] || row['Individual / Team'] || row['Target Participants'] || ''),
      deadline: row['Registration Deadline']?.trim() || '',
      regOpen: row['Registration Open']?.trim() || '-',
      eventDate: row['Event Date']?.trim() || '-',
      description: row['Description']?.trim() || '',
      topics: row['Description']?.trim() || row['Category']?.trim() || '-',
      requirements: row['Description']?.trim() || '-',
      location,
      prize: row['Prize']?.trim() || '-',
      fee: row['Registration Fee']?.trim() || 'Free / Unspecified',
      rating: row['Rating']?.trim() || row['Relevance Score']?.trim() || '',
      officialUrl: row['Source Link']?.trim() || '',
      regUrl: row['Registration Link']?.trim() || row['Source Link']?.trim() || '',
      status: normalizeStatus(rawStatus),
      rawStatus,
      notes: row['Description']?.trim() || '',
      lastVerified: row['Last Updated']?.trim() || '',
    });
  });

  // 2. Parse CSxEE-Competition (gid=232877020)
  csxeeRows.forEach((row, idx) => {
    const name = row['Competition Name']?.trim();
    if (!name) return;

    const organizer = row['Organizer']?.trim() || '';
    const rawStatus = row['Registration Status']?.trim() || '';
    const location = [row['Location']?.trim(), row['Country']?.trim()].filter(Boolean).join(', ') || 'Global';

    competitions.push({
      id: `csxee-${idx}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}`,
      sheetCategory: 'CSxEE-Competition',
      name,
      organizer,
      category: row['Category']?.trim() || 'Embedded / Robotics / CSxEE',
      field: 'Both',
      type: row['Competition Type']?.trim() || 'Hardware & Software Contest',
      eligibility: row['Eligibility']?.trim() || '-',
      teamFormat: normalizeTeamFormat(row['Team Format'] || row['Individual / Team'] || row['Eligibility'] || ''),
      deadline: row['Registration Deadline']?.trim() || '',
      regOpen: row['Registration Start']?.trim() || '-',
      eventDate: row['Competition Date']?.trim() || '-',
      description: row['CS × EE Relevance']?.trim() || '',
      topics: row['CS × EE Relevance']?.trim() || row['Category']?.trim() || '-',
      requirements: row['CS × EE Relevance']?.trim() || '-',
      location,
      prize: row['Prize']?.trim() || '-',
      fee: row['Registration Fee']?.trim() || 'Free / Unspecified',
      rating: row['Rating']?.trim() || row['Relevance Score']?.trim() || '',
      officialUrl: row['Official Website']?.trim() || row['Source URL']?.trim() || '',
      regUrl: row['Official Website']?.trim() || row['Source URL']?.trim() || '',
      status: normalizeStatus(rawStatus),
      rawStatus,
      notes: [row['Notes']?.trim(), row['CS × EE Relevance']?.trim()].filter(Boolean).join('\n\n'),
      lastVerified: row['Last Verified']?.trim() || row['Date Found']?.trim() || '',
    });
  });

  // 3. Parse Paper-Competition (gid=2117962469)
  paperRows.forEach((row, idx) => {
    const name = row['Competition Name']?.trim();
    if (!name) return;

    const organizer = row['Organizer']?.trim() || '';
    const rawStatus = row['Registration Status']?.trim() || '';

    competitions.push({
      id: `paper-${idx}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}`,
      sheetCategory: 'Paper-Competition',
      name,
      organizer,
      category: 'Paper & Research Competition',
      year: row['Edition / Year']?.trim() || '',
      field: row['Field — Elektro / Informatika / Both']?.trim() || 'Both',
      type: row['Competition Type']?.trim() || 'Student Paper Competition',
      eligibility: row['Eligibility']?.trim() || '-',
      teamFormat: row['Individual / Team']?.trim() || 'Individual / Team',
      teamSize: row['Team Size']?.trim() || '-',
      regOpen: row['Registration Opening Date']?.trim() || '-',
      deadline: row['Paper Submission Deadline']?.trim() || '',
      eventDate: row['Event Date']?.trim() || '-',
      topics: row['Theme / Research Topics']?.trim() || '-',
      requirements: row['Submission Requirements']?.trim() || '-',
      location: row['Location / Format']?.trim() || 'Online / In-person',
      prize: row['Prize / Awards']?.trim() || '-',
      fee: row['Registration Fee']?.trim() || 'Free / Unspecified',
      rating: row['Rating']?.trim() || row['Relevance Score']?.trim() || '',
      officialUrl: row['Official Website']?.trim() || '',
      regUrl: row['Registration Link']?.trim() || '',
      status: normalizeStatus(rawStatus),
      rawStatus,
      notes: row['Notes']?.trim() || '',
      lastVerified: row['Last Verified']?.trim() || '',
    });
  });

  return competitions.filter((competition) => competition.status !== 'Closed');
}
