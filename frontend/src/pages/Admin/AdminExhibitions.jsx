import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  useGetExhibitionsQuery,
  useDeleteExhibitionMutation,
} from "../../redux/api/exhibition.js";
import { useUpdateAdminExhibitionMutation } from "../../redux/api/admin.js";

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromLocalInput = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const AdminExhibitions = () => {
  const { data: exhibitions, isLoading, isError, refetch } = useGetExhibitionsQuery();
  const [deleteExhibition, { isLoading: deleting }] = useDeleteExhibitionMutation();
  const [updateExhibition, { isLoading: saving }] = useUpdateAdminExhibitionMutation();

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startLocal: "",
    endLocal: "",
    artworkIds: "",
  });

  const openEdit = (ex) => {
    setEditId(ex._id);
    const ids = (ex.artworkIds || [])
      .map((x) => (typeof x === "object" && x?._id ? x._id : x))
      .filter(Boolean);
    setForm({
      title: ex.title || "",
      description: ex.description || "",
      startLocal: toLocalInput(ex.startDate),
      endLocal: toLocalInput(ex.endDate),
      artworkIds: ids.join(", "),
    });
  };

  const save = async () => {
    if (!editId) return;
    const startDate = fromLocalInput(form.startLocal);
    const endDate = fromLocalInput(form.endLocal);
    if (!startDate || !endDate) {
      toast.error("Invalid dates");
      return;
    }
    const artworkIds = form.artworkIds
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (artworkIds.length === 0) {
      toast.error("Provide at least one artwork id");
      return;
    }
    try {
      await updateExhibition({
        id: editId,
        body: {
          title: form.title,
          description: form.description,
          startDate,
          endDate,
          artworkIds,
        },
      }).unwrap();
      toast.success("Exhibition updated");
      setEditId(null);
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.msg || "Update failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this exhibition?")) return;
    try {
      await deleteExhibition(id).unwrap();
      toast.success("Exhibition removed");
      if (editId === id) setEditId(null);
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.msg || "Delete failed");
    }
  };

  if (isLoading) {
    return (
      <p className="text-zinc-500 dark:text-white/50 text-sm">Loading exhibitions…</p>
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
          Exhibitions
        </h1>
        <p className="text-sm text-zinc-500 dark:text-white/45 mt-1">
          Edit details or remove exhibitions. Artwork ids are Mongo ObjectIds,
          comma-separated.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden bg-white/90 dark:bg-zinc-900/70">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-10 bg-zinc-100/95 dark:bg-zinc-800/95 text-zinc-600 dark:text-white/60 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Curator</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/8">
              {(exhibitions || []).map((ex) => (
                <tr key={ex._id} className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-2 font-medium text-zinc-900 dark:text-white max-w-[220px]">
                    <div className="truncate">{ex.title}</div>
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-white/60">
                    {ex.curatorId?.username || "—"}
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-white/60 whitespace-nowrap text-xs">
                    {ex.startDate
                      ? new Date(ex.startDate).toLocaleDateString()
                      : "—"}{" "}
                    →{" "}
                    {ex.endDate ? new Date(ex.endDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(ex)}
                      className="text-violet-600 dark:text-violet-400 text-xs font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => remove(ex._id)}
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

      {editId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Edit exhibition
            </h2>
            <label className="block text-xs font-medium text-zinc-500 dark:text-white/50">
              Title
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-zinc-500 dark:text-white/50">
                Start
                <input
                  type="datetime-local"
                  value={form.startLocal}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startLocal: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-zinc-500 dark:text-white/50">
                End
                <input
                  type="datetime-local"
                  value={form.endLocal}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endLocal: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-white/50">
              Artwork ids (comma-separated)
              <textarea
                value={form.artworkIds}
                onChange={(e) =>
                  setForm((f) => ({ ...f, artworkIds: e.target.value }))
                }
                rows={2}
                className="mt-1 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-sm font-mono text-xs"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="px-4 py-2 rounded-xl text-sm border border-zinc-200 dark:border-white/15 hover:bg-zinc-50 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="px-4 py-2 rounded-xl text-sm bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExhibitions;
