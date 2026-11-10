import type { Competition } from './types';

export function isCompetitionActive(competition: Competition, now: number): boolean {
  if (competition.status === 'Closed') return false;
  const date = competition.deadlineDate;
  return !date || now <= Date.parse(`${date}T23:59:59.999Z`);
}

export function getDaysLeft(deadlineDate: string, now: number): number {
  const [y, m, d] = deadlineDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const nowDate = new Date(now);
  const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDaysLeft(days: number): string {
  if (days < 0) return 'Closed';
  if (days === 0) return 'Hari Ini';
  return `${days}d left`;
}

const FREE_FEE_PATTERN = /\b(free|gratis)\b|\bno\b.*\bfee\b|tanpa\s+biaya|(?:\brp|\busd|\$)\s*0(?![\d.,])/i;

export function isFreeCompetition(competition: Competition): boolean {
  const fee = competition.fee.trim();
  if (/\b(unknown|unspecified|not specified|not published|free \/ unspecified)\b/i.test(fee)) {
    return false;
  }
  return FREE_FEE_PATTERN.test(fee);
}

export function matchesParticipation(competition: Competition, filter: 'All' | 'Individual' | 'Team'): boolean {
  if (filter === 'All') return true;
  const format = competition.teamFormat?.toLowerCase() || '';
  if (/individual \/ team|individual or team|individual\/team/.test(format)) return true;
  return filter === 'Individual' ? format.includes('individual') : format.includes('team');
}
