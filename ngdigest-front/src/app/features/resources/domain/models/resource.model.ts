export interface ScoreDetails {
  trustedSource: boolean;
  angularKeyword: boolean;
  isRecent: boolean;
}

export interface Resource {
  _id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  score: number;
  tags: string[];
  isRead: boolean;
  isFavorite: boolean;
  pinned: boolean;
  archivedAt: string | null;
  language: 'fr' | 'en' | 'unknown';
  highlighted?: boolean;
  scoreDetails?: ScoreDetails | null;
}
