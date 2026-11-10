export type SheetCategory = 'CS-Competition' | 'CSxEE-Competition' | 'Paper-Competition';

export interface Competition {
  id: string;
  sheetCategory: SheetCategory;
  name: string;
  organizer: string;
  category: string;
  year?: string;
  field?: 'Elektro' | 'Informatika' | 'Both' | string;
  type?: string;
  eligibility: string;
  teamFormat?: string;
  teamSize?: string;
  rating?: string;
  regOpen?: string;
  deadline: string;
  /** ISO YYYY-MM-DD parsed from `deadline`; '' when unknown. */
  deadlineDate: string;
  eventDate?: string;
  topics?: string;
  description?: string;
  requirements?: string;
  location: string;
  prize: string;
  fee: string;
  officialUrl?: string;
  regUrl?: string;
  sourceUrl?: string;
  status: 'Open' | 'Upcoming' | 'Closed';
  rawStatus?: string;
  notes?: string;
  lastVerified?: string;
}

export type FilterField = 'All' | 'Informatika' | 'Elektro' | 'Both';
export type FilterStatus = 'All' | 'Open' | 'Upcoming';
export type FilterFee = 'All' | 'Free';
export type FilterParticipation = 'All' | 'Individual' | 'Team';
export type SelectedSheet = 'All' | SheetCategory;
