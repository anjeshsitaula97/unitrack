import { Globe2, Pencil, Trash2 } from "lucide-react";
import { formatDate, type NewsItem } from "./news-types";

export default function NewsArticleCard({
  item,
  canPost,
  audienceLabel,
  onEdit,
  onDelete,
}: {
  item: NewsItem;
  canPost: boolean;
  audienceLabel: (item: NewsItem) => string;
  onEdit: (item: NewsItem) => void;
  onDelete: (item: NewsItem) => void;
}) {
  const isGlobal = item.audience === "all" || item.consultancyId == null;
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="font-bold text-slate-800">{item.title}</h2>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                isGlobal ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
              }`}
            >
              <Globe2 size={10} /> {audienceLabel(item)}
            </span>
            {!item.isPublished && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest">
                Draft
              </span>
            )}
            {item.isRead === false && (
              <span className="size-2 rounded-full bg-indigo-500" title="Unread" />
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {item.author?.name || "System"}
            {item.author?.email ? ` · ${item.author.email}` : ""} ·{" "}
            {formatDate(item.publishedAt || item.createdAt)}
          </p>
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{item.body}</p>
        </div>
        {canPost && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.title}`}
              className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              aria-label={`Delete ${item.title}`}
              className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
