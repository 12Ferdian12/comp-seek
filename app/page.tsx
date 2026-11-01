import { getCompetitions } from '@/lib/sheet';
import CompetitionDashboard from '@/components/CompetitionDashboard';
import { Competition } from '@/lib/types';

export default async function HomePage() {
  let competitions: Competition[] = [];
  let errorMsg = null;

  try {
    competitions = await getCompetitions();
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching sheet data:', err);
  }

  if (errorMsg && competitions.length === 0) {
    return (
      <div className="min-h-screen bg-[#040506] text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="border border-rose-500/30 bg-rose-500/10 p-6 max-w-md">
          <h2 className="text-rose-400 font-mono font-bold text-lg mb-2">SYNC ERROR</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Gagal mengambil data dari Google Sheet. Pastikan link spreadsheet dapat diakses publik.
          </p>
          <p className="text-xs font-mono text-zinc-500">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return <CompetitionDashboard initialCompetitions={competitions} />;
}
