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
}
