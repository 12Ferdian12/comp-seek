import { Competition } from './types';

const FREE_FEE_PATTERN = /(^|[^a-z])(free|gratis|no\b.*\bfee|tanpa\s+biaya|rp\s*0(?:\D|$)|0\s*(?:idr|rupiah)?)([^a-z]|$)/i;

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
