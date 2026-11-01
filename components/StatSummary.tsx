'use client';

import React from 'react';
import { Competition, SelectedSheet } from '@/lib/types';
import { Terminal, Cpu, BookOpen, Layers } from 'lucide-react';

interface Props {
  competitions: Competition[];
  selectedSheet: SelectedSheet;
}

export default function StatSummary({ competitions, selectedSheet }: Props) {
  const total = competitions.length;
  const csCount = competitions.filter((c) => c.sheetCategory === 'CS-Competition').length;
  const csxeeCount = competitions.filter((c) => c.sheetCategory === 'CSxEE-Competition').length;
  const paperCount = competitions.filter((c) => c.sheetCategory === 'Paper-Competition').length;

  const openCount = competitions.filter((c) => c.status === 'Open').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 p-px">
      {/* Total Active Scope */}
      <div className="bg-[#0B0F14] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-zinc-400 font-mono">
          <span>{selectedSheet === 'All' ? 'Total Indexed' : 'Selected Tab'}</span>
          <Layers className="w-4 h-4 text-zinc-500" />
        </div>
        <div className="mt-4">
          <div className="text-3xl font-mono font-bold tracking-tight text-white">{total}</div>
          <p className="text-xs text-[#A4FF01] mt-1 font-mono">
            {openCount} Open Submissions
          </p>
        </div>
      </div>

      {/* CS-Competition Tab Stat */}
      <div className="bg-[#0B0F14] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-cyan-400 font-mono">
          <span>CS-Competition</span>
          <Terminal className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-4">
          <div className="text-3xl font-mono font-bold tracking-tight text-white">{csCount}</div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Coding, AI, Hackathons</p>
        </div>
      </div>

      {/* CSxEE-Competition Tab Stat */}
      <div className="bg-[#0B0F14] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#A4FF01] font-mono">
          <span>CSxEE-Competition</span>
          <Cpu className="w-4 h-4 text-[#A4FF01]" />
        </div>
        <div className="mt-4">
          <div className="text-3xl font-mono font-bold tracking-tight text-[#A4FF01]">{csxeeCount}</div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Robotics &amp; Embedded</p>
        </div>
      </div>

      {/* Paper-Competition Tab Stat */}
      <div className="bg-[#0B0F14] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-amber-400 font-mono">
          <span>Paper Competition</span>
          <BookOpen className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-4">
          <div className="text-3xl font-mono font-bold tracking-tight text-white">{paperCount}</div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Conferences &amp; Research</p>
        </div>
      </div>
    </div>
  );
}
