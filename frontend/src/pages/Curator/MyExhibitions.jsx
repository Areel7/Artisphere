import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Calendar,
  Images,
  Loader2,
  AlertTriangle,
  X,
  GalleryHorizontalEnd,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetMyCuratorExhibitionsQuery,
  useDeleteExhibitionMutation,
} from "../../redux/api/exhibition.js";

const imgBase = import.meta.env.VITE_BASE_URL ?? "";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function exhibitionStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start)
    return {
      label: "Upcoming",
      color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    };
  if (now > end)
    return {
      label: "Ended",
      color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    };
  return {
    label: "Live",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  };
}

/* ── Delete Confirmation Modal ── */
const DeleteModal = ({ exhibition, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* backdrop */}
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    />
    {/* dialog */}
    <div className="relative z-10 w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-fade-in">
      <button
        onClick={onCancel}
        className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="text-rose-400" size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            Delete Exhibition
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            This action cannot be undone
          </p>
        </div>
      </div>

      <p className="text-zinc-300 text-sm mb-8 leading-relaxed">
        Are you sure you want to permanently delete{" "}
        <span className="text-white font-medium">"{exhibition.title}"</span>?
        This will remove it from the platform immediately.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isDeleting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Deleting…
            </>
          ) : (
            <>
              <Trash2 size={15} />
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

/* ── Exhibition Card ── */
const ExhibitionCard = ({ exhibition, onDeleteClick }) => {
  const status = exhibitionStatus(exhibition.startDate, exhibition.endDate);
  const artworks = Array.isArray(exhibition.artworkIds)
    ? exhibition.artworkIds
    : [];
  const preview = artworks.slice(0, 4);

  return (
    <div className="group relative bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/40">
      {/* Artwork mosaic header */}
      <div className="relative h-44 bg-zinc-900 overflow-hidden">
        {preview.length > 0 ? (
          <div
            className={`grid h-full ${preview.length === 1 ? "grid-cols-1" : preview.length === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"}`}
          >
            {preview.map((art, i) => {
              const src = art.image?.startsWith("http")
                ? art.image
                : `${imgBase}${art.image}`;
              return (
                <img
                  key={art._id || i}
                  src={src}
                  alt={art.title || ""}
                  className="w-full h-full object-cover"
                />
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <GalleryHorizontalEnd size={36} className="text-zinc-700" />
          </div>
        )}

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

        {/* Status badge */}
        <div
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${status.color}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {status.label}
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDeleteClick(exhibition)}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10 text-zinc-400 hover:text-rose-400 hover:border-rose-400/30 hover:bg-rose-500/10 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Delete exhibition"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-base leading-snug line-clamp-2 mb-3">
          {exhibition.title}
        </h3>

        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-4">
          {exhibition.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-zinc-600 mb-4">
          <span className="flex items-center gap-1.5">
            <Images size={13} className="text-zinc-500" />
            {artworks.length} artwork{artworks.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-zinc-500" />
            {formatDate(exhibition.createdAt)}
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-800/60">
          <Calendar size={13} className="text-zinc-500 flex-shrink-0" />
          <span>
            {formatDate(exhibition.startDate)}
            <span className="mx-1.5 text-zinc-700">→</span>
            {formatDate(exhibition.endDate)}
          </span>
        </div>

        {/* View link */}
        <Link
          to={`/exhibition/${exhibition._id}/room`}
          className="mt-4 flex items-center justify-center w-full py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-medium transition-colors"
        >
          View Exhibition
        </Link>
      </div>
    </div>
  );
};

/* ── Main Page ── */
const MyExibitions = () => {
  const {
    data: exhibitions,
    isLoading,
    isError,
    refetch,
  } = useGetMyCuratorExhibitionsQuery();
  const [deleteExhibition, { isLoading: isDeleting }] =
    useDeleteExhibitionMutation();

  const [toDelete, setToDelete] = useState(null);

  const handleDeleteClick = (exhibition) => setToDelete(exhibition);
  const handleCancelDelete = () => setToDelete(null);

  const handleConfirmDelete = async () => {
    try {
      await deleteExhibition(toDelete._id).unwrap();
      toast.success(`"${toDelete.title}" deleted successfully.`);
      setToDelete(null);
    } catch (err) {
      const msg =
        err?.data?.errors?.[0]?.msg ||
        err?.data?.message ||
        "Could not delete exhibition.";
      toast.error(msg);
    }
  };

  const list = Array.isArray(exhibitions) ? exhibitions : [];

  return (
    <>
      {/* Delete confirmation modal */}
      {toDelete && (
        <DeleteModal
          exhibition={toDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}

      <div className="min-h-screen text-zinc-100 pt-24 pb-32 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">
                Curator Dashboard
              </p>
              <h1 className="text-4xl font-light tracking-tighter text-zinc-900 dark:text-white">
                MY{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500 font-serif italic">
                  Exhibitions
                </span>
              </h1>
              {!isLoading && !isError && (
                <p className="text-zinc-500 text-sm mt-2">
                  {list.length} exhibition{list.length !== 1 ? "s" : ""} created
                </p>
              )}
            </div>

            <Link
              to="/curator/select-exhibition-artworks"
              className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-5 py-3 rounded-xl hover:bg-zinc-200 transition-colors flex-shrink-0"
            >
              <Plus size={16} />
              New Exhibition
            </Link>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 size={36} className="animate-spin text-zinc-600" />
              <p className="text-zinc-500 text-sm">Loading your exhibitions…</p>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle size={28} className="text-rose-400" />
              </div>
              <p className="text-zinc-300 font-medium">
                Failed to load exhibitions
              </p>
              <p className="text-zinc-600 text-sm">Please try again.</p>
              <button
                onClick={refetch}
                className="mt-2 px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <GalleryHorizontalEnd size={36} className="text-zinc-600" />
              </div>
              <div>
                <p className="text-zinc-200 font-medium text-lg">
                  No exhibitions yet
                </p>
                <p className="text-zinc-600 text-sm mt-1">
                  Create your first exhibition to showcase artworks.
                </p>
              </div>
              <Link
                to="/curator/select-exhibition-artworks"
                className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors"
              >
                <Plus size={16} />
                Create Exhibition
              </Link>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !isError && list.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {list.map((ex) => (
                <ExhibitionCard
                  key={ex._id}
                  exhibition={ex}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyExibitions;
