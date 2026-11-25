'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
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
  Share2,
  Check,
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Native modal dialog: focus trap, Escape, inert background, focus restore on close().
  useEffect(() => {
    const dialog = dialogRef.current;
    if (competition && dialog && !dialog.open) dialog.showModal();
  }, [competition]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  if (!competition) return null;

  const copied = copiedId === competition.id;
  const categories = competition.sheetCategories?.length
    ? competition.sheetCategories
    : [competition.sheetCategory];

  const showNotes = Boolean(
    competition.notes &&
      competition.notes !== competition.topics &&
      competition.notes !== competition.requirements
  );

  const handleShare = () => {
    const url = competition.officialUrl || window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: competition.name,
          text: `Cek lomba: ${competition.name} (${competition.organizer})`,
          url,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopiedId(competition.id);
          if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
          copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => {});
    }
  };

  // Generate Google Calendar Link if deadline exists
  const getGoogleCalendarUrl = () => {
    if (!competition.deadlineDate) return null;
    const dateStr = competition.deadlineDate.replaceAll('-', ''); // YYYYMMDD
    const title = encodeURIComponent(`[DEADLINE] ${competition.name}`);
    const details = encodeURIComponent(
      [
        `Penyelenggara: ${competition.organizer || '-'}`,
        competition.requirements ? `Requirements: ${competition.requirements}` : '',
        competition.officialUrl ? `URL: ${competition.officialUrl}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}T090000Z/${dateStr}T170000Z&details=${details}`;
  };

  const gCalUrl = getGoogleCalendarUrl();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-full max-w-none border-0 open:flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm backdrop:bg-transparent overflow-hidden"
    >
      <div className="relative w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[88dvh] bg-[#0B0F14] border border-white/15 shadow-2xl text-zinc-100 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:px-8 sm:pt-7 sm:pb-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-xs">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={`px-2 py-0.5 border ${
                    cat === 'CS-Competition'
                      ? 'border-cyan-500 text-cyan-300 bg-cyan-950/50'
                      : cat === 'CSxEE-Competition'
                      ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/10'
                      : 'border-amber-400 text-amber-300 bg-amber-950/50'
                  }`}
                >
                  {cat}
                </span>
              ))}

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

              {competition.type && <span className="text-zinc-400">{competition.type}</span>}
              {competition.rating && (
                <span className="text-amber-300">★ {competition.rating}</span>
              )}
              {competition.year && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">{competition.year}</span>
                </>
              )}
            </div>

            <h2 id={titleId} className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {competition.name}
            </h2>
            {competition.organizer && (
              <p className="text-sm text-zinc-400 mt-1">{competition.organizer}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleBookmark(competition.id)}
              className={`p-2 border transition-colors ${
                isBookmarked
                  ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/10'
                  : 'border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
              }`}
              title="Bookmark"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              aria-pressed={isBookmarked}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={handleShare}
              className={`p-2 border transition-colors inline-flex items-center gap-1.5 ${
                copied
                  ? 'border-[#A4FF01] text-[#A4FF01] bg-[#A4FF01]/10'
                  : 'border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
              }`}
              title={copied ? 'Link copied' : 'Share'}
              aria-label={copied ? 'Link copied' : 'Share'}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#A4FF01]" />
                  <span className="font-mono text-[10px] uppercase">COPIED</span>
                </>
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => dialogRef.current?.close()}
              className="p-2 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-6">
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/10 text-sm">
            {/* Timeline & Format */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#A4FF01]" />
                  <span>Important Dates</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-400">Submission Deadline:</span>
                    <span className="text-[#A4FF01] font-semibold text-right">{competition.deadline || 'TBA'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-400">Registration Open:</span>
                    <span className="text-zinc-200 text-right">{competition.regOpen || 'TBA'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-zinc-400">Event Date:</span>
                    <span className="text-zinc-200 text-right">{competition.eventDate || 'TBA'}</span>
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
                    <span className="text-zinc-400">Format:</span>{' '}
                    {competition.teamFormat || 'Unspecified'}
                    {competition.teamSize ? ` (${competition.teamSize})` : ''}
                  </div>
                  <div>
                    <span className="text-zinc-400">Criteria:</span>{' '}
                    {competition.eligibility || 'See official website'}
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
                  {competition.prize || 'See official website'}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registration Fee</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 text-xs text-zinc-300">
                  {competition.fee || 'Free / Unspecified'}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Submission Requirements</span>
                </div>
                <p className="bg-black/40 border border-white/5 p-3 text-xs text-zinc-300 leading-relaxed max-h-56 overflow-y-auto">
                  {competition.requirements || 'See official website for detailed rules & submission guidelines.'}
                </p>
              </div>
            </div>
          </div>

          {/* Topics & Notes */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Research / Theme Topics:
              </span>
              <p className="text-zinc-300 leading-relaxed">{competition.topics || competition.category}</p>
            </div>
            {showNotes && (
              <div className="bg-white/5 border border-white/10 p-3">
                <span className="font-mono text-[#A4FF01] uppercase tracking-wider block mb-1">
                  Curator Notes &amp; Observations:
                </span>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{competition.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="shrink-0 px-5 sm:px-8 py-4 border-t border-white/10 bg-[#0B0F14] flex flex-wrap items-center justify-between gap-3">
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
    </dialog>
  );
}
