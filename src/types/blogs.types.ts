export type BlogStatus = "draft" | "published" | "hidden";

export interface Blog {
  title: string;
  slug: string;
  summary?: string;
  content: string; // markdown
  coverImage?: string;
  tags?: string[];
  status: BlogStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
