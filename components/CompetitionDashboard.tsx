'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Competition, FilterFee, FilterField, FilterParticipation, FilterStatus, SelectedSheet } from '@/lib/types';
import { isFreeCompetition, matchesParticipation } from '@/lib/filters';
import CompetitionCard from './CompetitionCard';
import CompetitionModal from './CompetitionModal';
import StatSummary from './StatSummary';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Terminal,
  Cpu,
  BookOpen,
  LayoutGrid
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  initialCompetitions: Competition[];
}

export default function CompetitionDashboard({ initialCompetitions }: Props) {
  const router = useRouter();
  const [selectedSheet, setSelectedSheet] = useState<SelectedSheet>('All');
  const [search, setSearch] = useState('');
  const [fieldFilter, setFieldFilter] = useState<FilterField>('All');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All');
  const [feeFilter, setFeeFilter] = useState<FilterFee>('All');
  const [participationFilter, setParticipationFilter] = useState<FilterParticipation>('All');
  const [savedOnly, setSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'deadline' | 'name' | 'year'>('deadline');
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('comp_bookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch {
      // ignore storage access issues
    }
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('comp_bookmarks', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/revalidate');
      router.refresh();
    } catch {
      alert('Gagal merefresh cache spreadsheet');
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // Filter & sort competitions
  const filtered = useMemo(() => {
    return initialCompetitions
      .filter((comp) => {
        // Sheet category filter
        if (selectedSheet !== 'All' && comp.sheetCategory !== selectedSheet) {
          return false;
        }

        // Search term matching
        if (search.trim()) {
          const q = search.toLowerCase();
          const match =
            comp.name.toLowerCase().includes(q) ||
            comp.organizer.toLowerCase().includes(q) ||
            (comp.topics || '').toLowerCase().includes(q) ||
            (comp.description || '').toLowerCase().includes(q) ||
            (comp.field || '').toLowerCase().includes(q);
          if (!match) return false;
        }

        // Field filter
        if (fieldFilter !== 'All') {
          if (comp.field !== fieldFilter && comp.field !== 'Both') {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'All') {
          if (comp.status !== statusFilter) return false;
        }

        // Free registration filter
        if (feeFilter === 'Free' && !isFreeCompetition(comp)) {
          return false;
        }

        // Participation filter
        if (!matchesParticipation(comp, participationFilter)) {
          return false;
        }

        // Bookmark filter
        if (savedOnly) {
          if (!bookmarks.includes(comp.id)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'year') {
          return (b.year || '').localeCompare(a.year || '');
        }
        // Deadline sorting: ISO date matching
        const aDate = a.deadline.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] || '9999-99-99';
        const bDate = b.deadline.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] || '9999-99-99';
        return aDate.localeCompare(bDate);
      });
  }, [initialCompetitions, selectedSheet, search, fieldFilter, statusFilter, feeFilter, participationFilter, savedOnly, sortBy, bookmarks]);

  const sheetUrl = useMemo(() => {
    if (selectedSheet === 'CS-Competition') {
      return 'https://docs.google.com/spreadsheets/d/1xq0oASCqNLyXxE5-GaqQp4ZQgPhhRrtDIZLhtldu-70/edit?gid=0#gid=0';
    }
    if (selectedSheet === 'CSxEE-Competition') {
      return 'https://docs.google.com/spreadsheets/d/1xq0oASCqNLyXxE5-GaqQp4ZQgPhhRrtDIZLhtldu-70/edit?gid=232877020#gid=232877020';
    }
    if (selectedSheet === 'Paper-Competition') {
      return 'https://docs.google.com/spreadsheets/d/1xq0oASCqNLyXxE5-GaqQp4ZQgPhhRrtDIZLhtldu-70/edit?gid=2117962469#gid=2117962469';
    }
    return 'https://docs.google.com/spreadsheets/d/1xq0oASCqNLyXxE5-GaqQp4ZQgPhhRrtDIZLhtldu-70/edit';
  }, [selectedSheet]);

  const csCount = useMemo(
    () => initialCompetitions.filter((c) => c.sheetCategory === 'CS-Competition').length,
    [initialCompetitions]
  );
  const csxeeCount = useMemo(
    () => initialCompetitions.filter((c) => c.sheetCategory === 'CSxEE-Competition').length,
    [initialCompetitions]
  );
  const paperCount = useMemo(
    () => initialCompetitions.filter((c) => c.sheetCategory === 'Paper-Competition').length,
    [initialCompetitions]
  );

  return (
    <div className="min-h-screen bg-[#040506] text-zinc-100 flex flex-col grid-blueprint">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#040506]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#A4FF01]" />
            <span className="font-mono text-sm tracking-widest uppercase font-bold text-white">
              COMP-SEEK <span className="text-[#A4FF01]">//</span> RADAR
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh spreadsheet cache"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#A4FF01]' : ''}`} />
              <span className="hidden sm:inline">SYNC SHEET</span>
            </button>

            <a
              href={sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:border-[#A4FF01]/50 transition-colors"
            >
              <span className="hidden sm:inline">OPEN SHEET TAB</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-white/10 bg-[#070A0E] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono uppercase tracking-widest text-[#A4FF01] border border-[#A4FF01]/30 bg-[#A4FF01]/10 mb-4">
              <Sparkles className="w-3 h-3" />
              <span>Multi-Spreadsheet Live Sync</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              COMPETITION RADAR <br className="hidden sm:inline" />
              <span className="text-[#A4FF01]">CS, CS×EE &amp; RESEARCH PAPERS</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl font-sans leading-relaxed">
              Informasi terintegrasi dari 3 lembar kerja Google Spreadsheet: Computer Science, Interdisipliner CS × EE, dan Call for Papers.
            </p>
          </div>

          {/* Metric Stats */}
          <div className="mt-8">
            <StatSummary competitions={initialCompetitions} selectedSheet={selectedSheet} />
          </div>
        </div>
      </section>

      {/* Primary Category Switcher (Tabs for the 3 Spreadsheets) */}
      <div className="border-b border-white/10 bg-[#060A0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar gap-2 py-3">
            <button
              onClick={() => setSelectedSheet('All')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border transition-all whitespace-nowrap ${
                selectedSheet === 'All'
                  ? 'border-white text-white bg-white/10 font-bold shadow-sm'
                  : 'border-white/10 text-zinc-400 hover:text-white hover:border-white/30 bg-[#090D12]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>ALL SPREADSHEETS ({initialCompetitions.length})</span>
            </button>

            <button
              onClick={() => setSelectedSheet('CS-Competition')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border transition-all whitespace-nowrap ${
                selectedSheet === 'CS-Competition'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 font-bold ring-1 ring-cyan-400/50'
                  : 'border-white/10 text-zinc-400 hover:text-cyan-300 hover:border-cyan-500/40 bg-[#090D12]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>CS-COMPETITION ({csCount})</span>
            </button>

            <button
              onClick={() => setSelectedSheet('CSxEE-Competition')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border transition-all whitespace-nowrap ${
                selectedSheet === 'CSxEE-Competition'
                  ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/10 font-bold ring-1 ring-[#A4FF01]/50'
                  : 'border-white/10 text-zinc-400 hover:text-[#A4FF01] hover:border-[#A4FF01]/40 bg-[#090D12]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#A4FF01]" />
              <span>CSxEE-COMPETITION ({csxeeCount})</span>
            </button>

            <button
              onClick={() => setSelectedSheet('Paper-Competition')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border transition-all whitespace-nowrap ${
                selectedSheet === 'Paper-Competition'
                  ? 'border-amber-400 text-amber-300 bg-amber-950/40 font-bold ring-1 ring-amber-400/50'
                  : 'border-white/10 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 bg-[#090D12]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>PAPER COMPETITION ({paperCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Filter & Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-8">
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama lomba, organizer, topik riset, atau keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#090D12] border border-white/10 text-white placeholder-zinc-500 pl-10 pr-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#A4FF01] transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 hover:text-white"
                >
                  CLEAR
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#090D12] border border-white/10 px-3 py-2 text-xs font-mono">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-500">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'deadline' | 'name' | 'year')}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="deadline" className="bg-[#090D12] text-white">
                    Deadline Paling Dekat
                  </option>
                  <option value="name" className="bg-[#090D12] text-white">
                    Nama (A-Z)
                  </option>
                  <option value="year" className="bg-[#090D12] text-white">
                    Tahun Edisi
                  </option>
                </select>
              </div>

              <button
                onClick={() => setSavedOnly(!savedOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono border transition-colors ${
                  savedOnly
                    ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/10'
                    : 'border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>BOOKMARKED ({bookmarks.length})</span>
              </button>
            </div>
          </div>

          {/* Field & Status Pill Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Field Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider mr-1">
                FIELD:
              </span>
              {(['All', 'Informatika', 'Elektro', 'Both'] as FilterField[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFieldFilter(f)}
                  className={`px-3 py-1 text-xs font-mono border transition-colors ${
                    fieldFilter === f
                      ? 'border-[#A4FF01] text-black bg-[#A4FF01] font-bold'
                      : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white bg-[#090D12]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider mr-1">
                STATUS:
              </span>
              {(['All', 'Open', 'Upcoming', 'Closed'] as FilterStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 text-xs font-mono border transition-colors ${
                    statusFilter === s
                      ? s === 'Open'
                        ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/10 font-bold'
                        : s === 'Upcoming'
                        ? 'border-sky-400 text-sky-400 bg-sky-400/10 font-bold'
                        : 'border-zinc-500 text-white bg-zinc-800 font-bold'
                      : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white bg-[#090D12]'
                  }`}
                >
                  {s}
                </button>
              ))}
              {(['All', 'Individual', 'Team'] as FilterParticipation[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setParticipationFilter(p)}
                  className={`px-3 py-1 text-xs font-mono border transition-colors ${
                    participationFilter === p
                      ? 'border-sky-400 text-sky-300 bg-sky-400/10 font-bold'
                      : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white bg-[#090D12]'
                  }`}
                >
                  {p === 'All' ? 'ALL FORMAT' : p.toUpperCase()}
                </button>
              ))}
              <button
                onClick={() => setFeeFilter(feeFilter === 'Free' ? 'All' : 'Free')}
                className={`px-3 py-1 text-xs font-mono border transition-colors ${
                  feeFilter === 'Free'
                    ? 'border-[#A4FF01] text-black bg-[#A4FF01] font-bold'
                    : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white bg-[#090D12]'
                }`}
              >
                GRATIS
              </button>
            </div>
          </div>
        </div>

        {/* Results Count Banner */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6 font-mono text-xs text-zinc-400">
          <div>
            SHOWING <span className="text-[#A4FF01] font-bold">{filtered.length}</span> OF{' '}
            <span className="text-white">{initialCompetitions.length}</span> COMPETITIONS
          </div>
          {(search || fieldFilter !== 'All' || statusFilter !== 'All' || feeFilter !== 'All' || participationFilter !== 'All' || savedOnly) && (
            <button
              onClick={() => {
                setSearch('');
                setFieldFilter('All');
                setStatusFilter('All');
                setFeeFilter('All');
                setParticipationFilter('All');
                setSavedOnly(false);
              }}
              className="text-[#A4FF01] hover:underline"
            >
              RESET ALL FILTERS
            </button>
          )}
        </div>

        {/* Competition Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((comp) => (
              <CompetitionCard
                key={comp.id}
                competition={comp}
                onSelect={setSelectedComp}
                isBookmarked={bookmarks.includes(comp.id)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-white/15 bg-[#090D12]">
            <p className="font-mono text-sm text-zinc-400">
              Tidak ada kompetisi yang cocok dengan kriteria filter saat ini.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setFieldFilter('All');
                setStatusFilter('All');
                setFeeFilter('All');
                setParticipationFilter('All');
                setSavedOnly(false);
              }}
              className="mt-4 px-4 py-2 text-xs font-mono border border-[#A4FF01] text-[#A4FF01] hover:bg-[#A4FF01]/10 transition-colors"
            >
              RESET FILTER
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#06080C] py-8 px-4 sm:px-6 lg:px-8 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>COMP-SEEK // ARCHITECTURAL COMPETITION TRACKER</div>
          <div className="flex items-center gap-4">
            <span>LIVE GOOGLE SHEET DATA</span>
            <span>•</span>
            <span className="text-[#A4FF01]">AUTO-REVALIDATED</span>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      <CompetitionModal
        competition={selectedComp}
        onClose={() => setSelectedComp(null)}
        isBookmarked={selectedComp ? bookmarks.includes(selectedComp.id) : false}
        onToggleBookmark={toggleBookmark}
      />
    </div>
  );
}
