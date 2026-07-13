export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishDate: string; // ISO date, e.g. '2026-07-13'
  keywords: string[];
  contentHtml: string;
}

export const BLOG_POSTS: BlogPost[] = [];

export function estimateReadingTime(contentHtml: string): number {
  const text = contentHtml.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function sortedByNewest(posts: BlogPost[]): BlogPost[] {
  return posts.slice().sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}
