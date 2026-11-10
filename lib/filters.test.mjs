// Run: npm test  (Node >=23 strips TS types natively)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDaysLeft, getDaysLeft, isCompetitionActive, isFreeCompetition, matchesParticipation } from './filters.ts';
import { normalizeDate, normalizeStatus } from './sheet.ts';

const comp = (over = {}) => ({ status: 'Open', deadline: '', deadlineDate: '', fee: '', teamFormat: '', ...over });
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
