'use client';

import { formatDaysLeft, getDaysLeft } from '@/lib/filters';
import { Competition } from '@/lib/types';
import { Calendar, MapPin, Trophy, Bookmark, ArrowUpRight, Star } from 'lucide-react';

interface Props {
  competition: Competition;
  onSelect: (comp: Competition) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  now: number | null;
}

export default function CompetitionCard({
  competition,
  onSelect,
  isBookmarked,
  onToggleBookmark,
  now,
}: Props) {
  const daysLeft = competition.deadlineDate && now !== null
    ? getDaysLeft(competition.deadlineDate, now)
    : null;

  const categories = competition.sheetCategories?.length
    ? competition.sheetCategories
    : [competition.sheetCategory];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(competition)}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onSelect(competition);
        }
      }}
      aria-label={`View details for ${competition.name}`}
      className="group relative bg-[#090D12] border border-white/10 hover:border-[#A4FF01]/60 p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:shadow-[0_0_20px_rgba(164,255,1,0.06)]"
    >
      <div>
        {/* Top Header: Sheet Categories + Status + Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <span
                key={cat}
                className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border ${
                  cat === 'CS-Competition'
                    ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
                    : cat === 'CSxEE-Competition'
                    ? 'border-[#A4FF01]/40 text-[#A4FF01] bg-[#A4FF01]/10'
                    : 'border-amber-500/40 text-amber-300 bg-amber-950/40'
                }`}
              >
                {cat === 'CS-Competition'
                  ? 'CS'
                  : cat === 'CSxEE-Competition'
                  ? 'CS × EE'
                  : 'PAPER'}
              </span>
            ))}

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
              aria-label={`${isBookmarked ? 'Remove' : 'Add'} bookmark for ${competition.name}`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Title & Organizer */}
        <h3 className="text-base font-bold text-white group-hover:text-[#A4FF01] transition-colors leading-snug line-clamp-2">
          {competition.name}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-xs text-zinc-400 line-clamp-1">{competition.organizer}</p>
          {competition.rating && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 shrink-0">
              <Star className="w-3 h-3 fill-current" />
              {competition.rating}
            </span>
          )}
        </div>

        {/* Topics excerpt */}
        <div className="mt-3 bg-black/40 p-2.5 border border-white/5">
          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-mono">
            {competition.topics || competition.category}
          </p>
        </div>
      </div>

      {/* Meta Specs & Deadline */}
      <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
        {/* Deadline block */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Deadline:</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span
              className="text-white font-medium truncate max-w-[140px] inline-block align-bottom"
              title={competition.deadline || 'TBA'}
            >
              {competition.deadlineDate || competition.deadline || 'TBA'}
            </span>
            {daysLeft !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.5 border shrink-0 ${
                  daysLeft < 0
                    ? 'border-zinc-700 text-zinc-400 bg-zinc-900'
                    : daysLeft === 0
                    ? 'border-rose-500 text-rose-300 bg-rose-500/20 font-bold'
                    : daysLeft <= 7
                    ? 'border-orange-500 text-orange-300 bg-orange-500/15 font-semibold'
                    : daysLeft <= 30
                    ? 'border-amber-400/60 text-amber-300 bg-amber-400/10'
                    : 'border-[#A4FF01]/40 text-[#A4FF01] bg-[#A4FF01]/5'
                }`}
              >
                {formatDaysLeft(daysLeft)}
              </span>
            )}
          </div>
        </div>

        {/* Location & Prize */}
        <div className="flex items-center justify-between text-xs text-zinc-400 gap-2">
          <div className="flex items-center gap-1.5 truncate max-w-[55%]">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <span className="truncate">{competition.location}</span>
          </div>
          {competition.prize && (
            <div className="flex items-center gap-1 text-amber-300/80 text-[11px] font-mono shrink-0">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="truncate max-w-[140px]" title={competition.prize}>
                {competition.prize}
              </span>
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
