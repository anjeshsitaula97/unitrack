export interface NewsItem {
  id: number;
  title: string;
  body: string;
  audience: "all" | "consultancy";
  isPublished: boolean;
  publishedAt: string | null;
  consultancyId: number | null;
  author: { name: string; email: string } | null;
  isRead?: boolean;
  createdAt: string;
}

export interface ConsultancyOption {
  id: number;
  name: string;
  code: string;
}

export interface NewsForm {
  title: string;
  body: string;
  audience: "all" | "consultancy";
  consultancyId: string;
  isPublished: boolean;
}

export const EMPTY_FORM: NewsForm = {
  title: "",
  body: "",
  audience: "consultancy",
  consultancyId: "",
  isPublished: true,
};

export function formatDate(value: string | null): string {
  if (!value) return "Not published";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
