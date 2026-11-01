'use client';

import React from 'react';
import { Competition } from '@/lib/types';
import { Calendar, MapPin, Trophy, Bookmark, ArrowUpRight } from 'lucide-react';

interface Props {
  competition: Competition;
  onSelect: (comp: Competition) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export default function CompetitionCard({
  competition,
  onSelect,
  isBookmarked,
  onToggleBookmark,
}: Props) {
  // Format remaining days if ISO format
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getDaysLeft = (deadlineStr: string) => {
    if (!mounted || !deadlineStr || deadlineStr.toLowerCase().includes('not specified')) return null;
    const match = deadlineStr.match(/\b\d{4}-\d{2}-\d{2}\b/);
    if (!match) return null;
    const target = new Date(match[0]).getTime();
    const now = Date.now();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysLeft(competition.deadline);

  return (
    <div
      onClick={() => onSelect(competition)}
      className="group relative bg-[#090D12] border border-white/10 hover:border-[#A4FF01]/60 p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:shadow-[0_0_20px_rgba(164,255,1,0.06)]"
    >
      <div>
        {/* Top Header: Sheet Category + Status + Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border ${
                competition.sheetCategory === 'CS-Competition'
                  ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
                  : competition.sheetCategory === 'CSxEE-Competition'
                  ? 'border-[#A4FF01]/40 text-[#A4FF01] bg-[#A4FF01]/10'
                  : 'border-amber-500/40 text-amber-300 bg-amber-950/40'
              }`}
            >
              {competition.sheetCategory === 'CS-Competition'
                ? 'CS'
                : competition.sheetCategory === 'CSxEE-Competition'
                ? 'CS × EE'
                : 'PAPER'}
            </span>

            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border ${
                competition.status === 'Open'
                  ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/10'
                  : competition.status === 'Upcoming'
                  ? 'border-sky-400 text-sky-400 bg-sky-400/10'
                  : 'border-zinc-700 text-zinc-400 bg-zinc-900'
              }`}
            >
              {competition.status}
            </span>

            {competition.field && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-white/10 text-zinc-400 bg-white/5">
                {competition.field}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(competition.id);
              }}
              className={`p-1.5 border transition-colors ${
                isBookmarked
                  ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/15'
                  : 'border-white/5 text-zinc-500 hover:text-white hover:border-white/20'
              }`}
              title="Bookmark"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Title & Organizer */}
        <h3 className="text-base font-bold text-white group-hover:text-[#A4FF01] transition-colors leading-snug line-clamp-2">
          {competition.name}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{competition.organizer}</p>

        {/* Topics excerpt */}
        <p className="text-xs text-zinc-300 mt-3 line-clamp-2 leading-relaxed bg-black/40 p-2.5 border border-white/5 font-mono">
          {competition.topics}
        </p>
      </div>

      {/* Meta Specs & Deadline */}
      <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
        {/* Deadline block */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Deadline:</span>
          </div>
          <div className="text-right">
            <span className="text-white font-medium">
              {competition.deadline.slice(0, 16) || 'TBA'}
            </span>
            {daysLeft !== null && (
              <span
                className={`ml-2 text-[10px] px-1.5 py-0.2 border ${
                  daysLeft <= 7
                    ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                    : daysLeft <= 30
                    ? 'border-amber-400 text-amber-300 bg-amber-400/10'
                    : 'border-[#A4FF01]/40 text-[#A4FF01] bg-[#A4FF01]/5'
                }`}
              >
                {daysLeft < 0 ? 'Closed' : `${daysLeft}d left`}
              </span>
            )}
          </div>
        </div>

        {/* Location & Prize */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 truncate max-w-[60%]">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <span className="truncate">{competition.location}</span>
          </div>
          {competition.prize && competition.prize !== '-' && (
            <div className="flex items-center gap-1 text-amber-300/80 text-[11px] font-mono shrink-0">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="truncate max-w-[120px]">{competition.prize.slice(0, 16)}</span>
            </div>
          )}
        </div>

        {/* Quick Click-Through Bar */}
        <div className="pt-2 flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
          <span>SPEC DETAILS</span>
          <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-[#A4FF01] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>
  );
}
