'use client';

import React from 'react';
import { Competition } from '@/lib/types';
import {
  X,
  ExternalLink,
  Calendar,
  MapPin,
  Trophy,
  Users,
  FileText,
  DollarSign,
  CheckCircle2,
  Bookmark,
  Share2
} from 'lucide-react';

interface Props {
  competition: Competition | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export default function CompetitionModal({
  competition,
  onClose,
  isBookmarked,
  onToggleBookmark,
}: Props) {
  if (!competition) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: competition.name,
        text: `Cek lomba: ${competition.name} (${competition.organizer})`,
        url: competition.officialUrl || window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(competition.officialUrl || window.location.href);
      alert('Link disalin ke clipboard');
    }
  };

  // Generate Google Calendar Link if deadline exists
  const getGoogleCalendarUrl = () => {
    if (!competition.deadline || competition.deadline.toLowerCase().includes('not specified')) return null;
    const cleanDate = competition.deadline.replace(/[^0-9]/g, '');
    if (cleanDate.length < 8) return null;
    const dateStr = cleanDate.slice(0, 8); // YYYYMMDD
    const title = encodeURIComponent(`[DEADLINE] ${competition.name}`);
    const details = encodeURIComponent(
      `Penyelenggara: ${competition.organizer}\nRequirements: ${competition.requirements}\nURL: ${competition.officialUrl}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}T090000Z/${dateStr}T170000Z&details=${details}`;
  };

  const gCalUrl = getGoogleCalendarUrl();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#0B0F14] border border-white/15 shadow-2xl p-6 sm:p-8 text-zinc-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-xs">
              <span
                className={`px-2 py-0.5 border ${
                  competition.sheetCategory === 'CS-Competition'
                    ? 'border-cyan-500 text-cyan-300 bg-cyan-950/50'
                    : competition.sheetCategory === 'CSxEE-Competition'
                    ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/10'
                    : 'border-amber-400 text-amber-300 bg-amber-950/50'
                }`}
              >
                {competition.sheetCategory}
              </span>

              <span
                className={`px-2 py-0.5 border ${
                  competition.status === 'Open'
                    ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/10'
                    : competition.status === 'Upcoming'
                    ? 'border-sky-400 text-sky-400 bg-sky-400/10'
                    : 'border-zinc-600 text-zinc-400 bg-zinc-800'
                }`}
              >
                {competition.status}
              </span>

              {competition.field && (
                <span className="px-2 py-0.5 border border-white/15 text-zinc-300 bg-white/5">
                  {competition.field}
                </span>
              )}

              <span className="text-zinc-400">{competition.type}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{competition.year}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {competition.name}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">{competition.organizer}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(competition.id)}
              className={`p-2 border transition-colors ${
                isBookmarked
                  ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/10'
                  : 'border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
              }`}
              title="Bookmark"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-white/10 text-sm">
          {/* Timeline & Format */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#A4FF01]" />
                <span>Important Dates</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-3 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Submission Deadline:</span>
                  <span className="text-[#A4FF01] font-semibold">{competition.deadline || 'TBA'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Registration Open:</span>
                  <span className="text-zinc-200">{competition.regOpen || 'TBA'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Event Date:</span>
                  <span className="text-zinc-200">{competition.eventDate || 'TBA'}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>Location / Format</span>
              </div>
              <p className="text-zinc-300 bg-black/40 border border-white/5 p-3 text-xs leading-relaxed">
                {competition.location}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>Eligibility &amp; Team Size</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-3 space-y-1 text-xs">
                <div>
                  <span className="text-zinc-400">Format:</span> {competition.teamFormat} (
                  {competition.teamSize})
                </div>
                <div>
                  <span className="text-zinc-400">Criteria:</span> {competition.eligibility}
                </div>
              </div>
            </div>
          </div>

          {/* Awards & Requirements */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Prize &amp; Awards</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-3 text-xs text-amber-200/90 leading-relaxed">
                {competition.prize}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Registration Fee</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-3 text-xs text-zinc-300">
                {competition.fee}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Submission Requirements</span>
              </div>
              <p className="bg-black/40 border border-white/5 p-3 text-xs text-zinc-300 leading-relaxed max-h-36 overflow-y-auto">
                {competition.requirements}
              </p>
            </div>
          </div>
        </div>

        {/* Topics & Notes */}
        <div className="py-4 space-y-3 text-xs border-b border-white/10">
          <div>
            <span className="font-mono text-zinc-400 uppercase tracking-wider block mb-1">
              Research / Theme Topics:
            </span>
            <p className="text-zinc-300 leading-relaxed">{competition.topics}</p>
          </div>
          {competition.notes && (
            <div className="bg-white/5 border border-white/10 p-3">
              <span className="font-mono text-[#A4FF01] uppercase tracking-wider block mb-1">
                Curator Notes &amp; Observations:
              </span>
              <p className="text-zinc-300 leading-relaxed">{competition.notes}</p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <CheckCircle2 className="w-4 h-4 text-[#A4FF01]" />
            <span>Verified: {competition.lastVerified || 'Active'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {gCalUrl && (
              <a
                href={gCalUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-xs font-mono border border-white/20 text-zinc-300 hover:text-white hover:border-white/40 transition-colors inline-flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Add to GCal</span>
              </a>
            )}

            {competition.officialUrl && (
              <a
                href={competition.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-xs font-mono border border-white/20 text-zinc-200 hover:text-white hover:border-white/50 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Official Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {competition.regUrl && (
              <a
                href={competition.regUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-xs font-mono font-bold bg-[#A4FF01] text-black hover:bg-[#b5ff2b] transition-colors inline-flex items-center gap-1.5"
              >
                <span>Register / Submit</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
