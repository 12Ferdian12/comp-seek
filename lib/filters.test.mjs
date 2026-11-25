// Run: npm test  (Node >=23 strips TS types natively)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDaysLeft, getDaysLeft, isCompetitionActive, isFreeCompetition, matchesParticipation } from './filters.ts';
import {
  cleanText,
  deduplicateCompetitions,
  normalizeDate,
  normalizeStatus,
  sanitizeRating,
  slugifyCompetitionId,
} from './sheet.ts';

const comp = (over = {}) => ({
  id: 'comp-test',
  sheetCategory: 'CS-Competition',
  sheetCategories: ['CS-Competition'],
  name: 'Test Comp',
  organizer: 'Org',
  category: 'AI',
  eligibility: '',
  location: 'Global',
  prize: '',
  status: 'Open',
  deadline: '',
  deadlineDate: '',
  fee: '',
  teamFormat: '',
  ...over,
});
const at = (iso) => Date.parse(iso);

test('normalizeStatus', () => {
  assert.equal(normalizeStatus(''), 'Upcoming');
  assert.equal(normalizeStatus('Registration closed'), 'Closed');
  assert.equal(normalizeStatus('Opening soon'), 'Upcoming');
  assert.equal(normalizeStatus('Upcoming; submissions open 2026-12-11'), 'Upcoming');
  assert.equal(normalizeStatus('Accepting submissions'), 'Open');
  assert.equal(normalizeStatus('Open; deadline 2026-11-06'), 'Open');
});

test('normalizeDate extracts first ISO date', () => {
  assert.equal(normalizeDate('2026-11-14 AOE'), '2026-11-14');
  assert.equal(normalizeDate('2026-11-15; competition registration 2026-11-20'), '2026-11-15');
  assert.equal(normalizeDate('Unknown'), '');
  assert.equal(normalizeDate('Submission deadline TBA'), '');
  assert.equal(normalizeDate('2026-12'), '');
});

test('isCompetitionActive: closed and expiry', () => {
  assert.equal(isCompetitionActive(comp({ status: 'Closed' }), at('2026-01-01T00:00:00Z')), false);
  assert.equal(isCompetitionActive(comp(), at('2030-01-01T00:00:00Z')), true, 'unknown deadline stays visible');
  const c = comp({ deadlineDate: '2026-11-10' });
  assert.equal(isCompetitionActive(c, at('2026-11-10T23:59:59Z')), true, 'deadline day inclusive');
  assert.equal(isCompetitionActive(c, at('2026-11-11T00:00:00Z')), false);
});

test('isFreeCompetition', () => {
  for (const fee of ['Free', 'Gratis', 'Rp 0', 'Rp0', 'USD 0', 'Gratis ($0)', 'No registration fee', 'Tanpa biaya']) {
    assert.equal(isFreeCompetition(comp({ fee })), true, fee);
  }
  for (const fee of ['Rp 50.000', 'Rp50.000 per tim', '$1,500 per team', 'USD 300 per team', '€150', 'Rp100.000', 'Unknown', 'Not specified', 'Free / unspecified', '']) {
    assert.equal(isFreeCompetition(comp({ fee })), false, fee);
  }
});

test('getDaysLeft and formatDaysLeft', () => {
  const nov10 = new Date(2026, 10, 10, 15, 30).getTime();
  assert.equal(getDaysLeft('2026-11-10', nov10), 0);
  assert.equal(formatDaysLeft(0), 'Hari Ini');
  assert.equal(getDaysLeft('2026-11-11', nov10), 1);
  assert.equal(formatDaysLeft(1), '1d left');
  assert.equal(getDaysLeft('2026-11-09', nov10), -1);
  assert.equal(formatDaysLeft(-1), 'Closed');
});

test('matchesParticipation', () => {

  const ind = comp({ teamFormat: 'Individual' });
  const team = comp({ teamFormat: 'Team' });
  const both = comp({ teamFormat: 'Individual / Team' });
  assert.equal(matchesParticipation(ind, 'All'), true);
  assert.equal(matchesParticipation(ind, 'Individual'), true);
  assert.equal(matchesParticipation(ind, 'Team'), false);
  assert.equal(matchesParticipation(team, 'Team'), true);
  assert.equal(matchesParticipation(team, 'Individual'), false);
  assert.equal(matchesParticipation(both, 'Individual'), true);
  assert.equal(matchesParticipation(both, 'Team'), true);
  assert.equal(matchesParticipation(comp(), 'Team'), false);
});

test('cleanText strips placeholder tokens', () => {
  assert.equal(cleanText('  -  '), '');
  assert.equal(cleanText('Tidak ditemukan'), '');
  assert.equal(cleanText('Unknown'), '');
  assert.equal(cleanText('TBA'), '');
  assert.equal(cleanText('N/A'), '');
  assert.equal(cleanText('  Valid requirement  '), 'Valid requirement');
});

test('sanitizeRating normalizes formats and recovers sheet date serials', () => {
  assert.equal(sanitizeRating('46117'), '4/5');
  assert.equal(sanitizeRating('5 of 5'), '5/5');
  assert.equal(sanitizeRating('4 out of 5'), '4/5');
  assert.equal(sanitizeRating('4/5'), '4/5');
  assert.equal(sanitizeRating('4.5'), '4.5/5');
  assert.equal(sanitizeRating('Tidak ditemukan'), '');
  assert.equal(sanitizeRating('99999'), '');
});

test('slugifyCompetitionId generates deterministic index-free IDs', () => {
  assert.equal(
    slugifyCompetitionId('2027 IEEE Radar Conference!'),
    slugifyCompetitionId('2027 IEEE Radar Conference!')
  );
  assert.equal(slugifyCompetitionId('LakeCTF Quals 26-27'), 'comp-lakectf-quals-26-27');
});

test('deduplicateCompetitions merges cross-sheet entries and enriches fields', () => {
  const result = deduplicateCompetitions([
    comp({
      sheetCategory: 'CS-Competition',
      sheetCategories: ['CS-Competition'],
      name: '2027 IEEE Radar Conference',
      field: 'Informatika',
      status: 'Upcoming',
      location: 'Online / Global',
      fee: 'Free / Unspecified',
      requirements: '',
    }),
    comp({
      sheetCategory: 'Paper-Competition',
      sheetCategories: ['Paper-Competition'],
      name: '2027 IEEE Radar Conference',
      field: 'Elektro',
      status: 'Open',
      location: 'Seattle, USA',
      fee: 'USD 400',
      requirements: '6-page IEEE double-column paper',
      teamSize: '1-4 authors',
    }),
    comp({
      sheetCategory: 'CS-Competition',
      sheetCategories: ['CS-Competition'],
      name: 'Ended Hackathon',
      status: 'Closed',
    }),
  ]);

  assert.equal(result.length, 1);
  assert.deepEqual(result[0].sheetCategories, ['CS-Competition', 'Paper-Competition']);
  assert.equal(result[0].field, 'Both');
  assert.equal(result[0].status, 'Open');
  assert.equal(result[0].location, 'Seattle, USA');
  assert.equal(result[0].fee, 'USD 400');
  assert.equal(result[0].requirements, '6-page IEEE double-column paper');
  assert.equal(result[0].teamSize, '1-4 authors');
  assert.equal(result[0].id, 'comp-2027-ieee-radar-conference');
});
