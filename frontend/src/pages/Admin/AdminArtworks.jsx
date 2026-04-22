import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  useGetAllArtworksQuery,
  useUpdateArtworkMutation,
  useDeleteArtworkMutation,
} from "../../redux/api/artwork.js";

const AdminArtworks = () => {
  const {
    data: artworks,
    isLoading,
    isError,
    refetch,
  } = useGetAllArtworksQuery();
  const [updateArtwork, { isLoading: updating }] = useUpdateArtworkMutation();
  const [deleteArtwork, { isLoading: deleting }] = useDeleteArtworkMutation();

  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    story: "",
    price: "",
    tags: "",
  });

  const openEdit = (a) => {
    setEdit(a._id);
    setForm({
      title: a.title || "",
      description: a.description || "",
      story: a.story || "",
      price: String(a.price ?? ""),
      tags: Array.isArray(a.tags) ? a.tags.join(", ") : "",
    });
  };

  const saveEdit = async () => {
    if (!edit) return;
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Invalid price");
      return;
    }
    try {
      await updateArtwork({
        id: edit,
        data: {
          title: form.title,
          description: form.description,
          story: form.story,
          price,
          tags: tags.length ? tags : ["general"],
        },
      }).unwrap();
      toast.success("Artwork updated");
      setEdit(null);
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.msg || "Update failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this artwork?")) return;
    try {
      await deleteArtwork(id).unwrap();
      toast.success("Artwork removed");
      if (edit === id) setEdit(null);
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.msg || "Delete failed");
    }
  };

  if (isLoading) {
    return (
      <p className="text-zinc-500 dark:text-white/50 text-sm">
        Loading artworks…
      </p>
    );
  }
  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4 text-sm">
        Failed to load.{" "}
        <button type="button" onClick={() => refetch()} className="underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
          Artworks
        </h1>
        <p className="text-sm text-zinc-500 dark:text-white/45 mt-1">
          Edit listings or remove artworks from the platform.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white/90 dark:bg-zinc-900/70">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-10 bg-zinc-100/95 dark:bg-zinc-800/95 text-zinc-600 dark:text-white/60 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Preview</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Artist</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/8">
              {(artworks || []).map((a) => (
                <tr
                  key={a._id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-2 w-20">
                    {a.image ? (
                      <img
                        src={
                          a.image?.startsWith("http")
                            ? a.image
                            : `${import.meta.env.VITE_BASE_URL || ""}${a.image}`
                        }
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover border border-zinc-200 dark:border-white/10"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-zinc-200 dark:bg-white/10" />
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium text-zinc-900 dark:text-white max-w-[200px] truncate">
                    {a.title}
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-white/60">
                    {a.artistId?.username || "—"}
                  </td>
                  <td className="px-4 py-2">${Number(a.price).toFixed(2)}</td>
                  <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(a)}
                      className="text-violet-600 dark:text-violet-400 text-xs font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => remove(a._id)}
                      className="text-red-600 dark:text-red-400 text-xs font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {edit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Edit artwork
            </h2>
            <label className="block text-xs font-medium text-zinc-500 dark:text-white/50">
              Title
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-500 dark:text-white/50">
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-500 dark:text-white/50">
              Story
              <textarea
                value={form.story}
                onChange={(e) =>
                  setForm((f) => ({ ...f, story: e.target.value }))
                }
                rows={4}
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-500 dark:text-white/50">
              Price (USD)
              <input
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-500 dark:text-white/50">
              Tags (comma-separated)
              <input
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEdit(null)}
                className="px-4 py-2 rounded-xl text-sm border border-zinc-200 dark:border-white/15 hover:bg-zinc-50 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={saveEdit}
                className="px-4 py-2 rounded-xl text-sm bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50"
              >
                {updating ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArtworks;
