# PRD: Portal Info Lomba Terpadu (COMP-SEEK)

## 1. Ringkasan & Tujuan
Platform kurasi kompetisi pribadi (Elektro, Informatika, Paper, Design, Student Research). Data sinkron langsung dari Google Sheet publik tanpa database backend terpisah.
UI/UX: Minimalis arsitektural, dark theme, kontras tinggi (inspirasi Dribbble QuickFrame: `#040506` hitam pekat, aksen `#A4FF01` neon lime).

## 2. Sumber Data & Sinkronisasi
- **Source:** Google Sheet (`1xq0oASCqNLyXxE5-GaqQp4ZQgPhhRrtDIZLhtldu-70`) dengan 3 lembar kerja:
  1. `CS-Competition` (`gid=0`): Programming, Hackathon, CTF, AI/ML.
  2. `CSxEE-Competition` (`gid=232877020`): Robotics, Embedded Systems, IoT, Hardware.
  3. `Paper-Competition` (`gid=2117962469`): Student Research, Call for Papers, Conference Tracks.
- **Mekanisme Sync:** Fetch endpoint CSV paralel ketiga tab langsung:
  `https://docs.google.com/spreadsheets/d/1xq0oASCqNLyXxE5-GaqQp4ZQgPhhRrtDIZLhtldu-70/export?format=csv&gid=<GID>`
- **Cache Policy:** Next.js ISR (`revalidate: 3600`) + On-demand revalidation route (`/api/revalidate?secret=...`).

## 3. Fitur Utama
1. **Primary Spreadsheet Switcher:** Tab khusus untuk beralih antara `All Spreadsheets`, `CS-Competition`, `CSxEE-Competition`, dan `Paper Competition`.
2. **Stat Summary:** Breakdown metrik jumlah lomba per tab dan status submission.
3. **Filter & Search:**
   - Field: All, Informatika, Elektro, Both.
   - Status: All, Open, Upcoming, Closed.
   - Search: Keyword pencarian langsung di judul, penyelenggara, deskripsi, dan topik riset.
   - Sort: Deadline paling dekat, nama A-Z, tahun edisi.
4. **Card Grid & Architectural Layout:**
   - Tag kategori sheet spesifik (CS: Cyan, CS×EE: Lime, Paper: Amber).
   - Deadline countdown indicator (hari tersisa / status).
   - High-contrast minimal blueprint design.
5. **Detail Spec Modal:**
   - Full requirements, lokasi, eligibility, hadiah, registration fee, catatan kurasi.
   - Quick export Google Calendar.
   - Direct link ke situs resmi dan registrasi.
6. **Bookmark Storage:**
   - Disimpan di `localStorage` per browser.
