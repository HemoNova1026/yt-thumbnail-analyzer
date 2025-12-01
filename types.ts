export interface ThumbnailData {
  id: string;
  title: string;
  thumbnailUrl: string;
  ctr: number; // Stored as percentage value e.g. 5.5
  views: number;
  rating: string; // "S", "A", "B", "C", etc.
  rawRow: Record<string, string>;
}

export type SortOption = 'ctr-desc' | 'ctr-asc' | 'rating-desc';

export interface SheetConfig {
  url: string;
}

export interface AnalysisResult {
  markdown: string;
}