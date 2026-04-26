import React, { useMemo, useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Type,
  AlignLeft,
  Calendar,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Images,
} from "lucide-react";
import { toast } from "react-toastify";
import { useGetAllArtworksQuery } from "../../redux/api/artwork.js";
import { useCreateExhibitionMutation } from "../../redux/api/exhibition.js";
import { artistLabel, artworkTitle } from "../../utils/artworkMeta.js";

const STORAGE_KEY = "curatorExhibitionArtworkIds";
const imgBase = import.meta.env.VITE_BASE_URL ?? "";

function readStoredArtworkIds(locationState) {
  const fromState = locationState?.artworkIds;
  if (Array.isArray(fromState) && fromState.length > 0) {
    return new Set(fromState.map(String));
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return new Set(parsed.map(String));
      }
    }
  } catch {
    /* ignore */
  }
  return new Set();
}

const CreateExhibition = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ message: "", type: "" });
  const [selectedIds, setSelectedIds] = useState(() =>
    readStoredArtworkIds(location.state),
  );

  useEffect(() => {
    const ids = location.state?.artworkIds;
    if (Array.isArray(ids) && ids.length > 0) {
      setSelectedIds(new Set(ids.map(String)));
    }
  }, [location.state?.artworkIds]);

  const { data: artworks, isLoading: loadingArt, isError: artError } =
    useGetAllArtworksQuery();
  const [createExhibition, { isLoading: submitting }] =
    useCreateExhibitionMutation();

  const list = useMemo(() => (Array.isArray(artworks) ? artworks : []), [artworks]);

  const selectedArtworks = useMemo(
    () => list.filter((a) => selectedIds.has(String(a._id))),
    [list, selectedIds],
  );

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      auctionEnabled: false,
      auctionDurationMinutes: 15,
    },

    validationSchema: Yup.object({
      title: Yup.string()
        .min(3, "Title must be at least 3 characters")
        .required("Title is required"),

      description: Yup.string()
        .min(10, "Description must be at least 10 characters")
        .required("Description is required"),

      startDate: Yup.date().required("Start date is required"),

      endDate: Yup.date()
        .required("End date is required")
        .min(Yup.ref("startDate"), "End date must be after start date"),

      auctionEnabled: Yup.boolean(),

      auctionDurationMinutes: Yup.number()
        .optional()
        .when("auctionEnabled", {
          is: true,
          then: (schema) =>
            schema
              .min(1, "At least 1 minute")
              .max(10080, "Max 7 days (10080 minutes)")
              .required("Set auction duration"),
        }),
    }),

    onSubmit: async (values, { resetForm }) => {
      setStatus({ message: "", type: "" });

      if (selectedIds.size === 0) {
        const msg = "Select artworks first.";
        setStatus({ message: msg, type: "error" });
        toast.error(msg);
        navigate("/curator/select-exhibition-artworks");
        return;
      }

      try {
        await createExhibition({
          title: values.title.trim(),
          description: values.description.trim(),
          startDate: values.startDate,
          endDate: values.endDate,
          artworkIds: [...selectedIds],
          auctionEnabled: Boolean(values.auctionEnabled),
          auctionDurationMinutes: values.auctionEnabled
            ? Number(values.auctionDurationMinutes)
            : undefined,
        }).unwrap();

        sessionStorage.removeItem(STORAGE_KEY);
        const msg = "Exhibition created successfully.";
        setStatus({ message: msg, type: "success" });
        toast.success(msg);
        resetForm();
        setSelectedIds(new Set());
        navigate("/curator/select-exhibition-artworks", { replace: true });
      } catch (err) {
        const apiErrors = err?.data?.errors;
        const msg = Array.isArray(apiErrors)
          ? apiErrors[0]?.msg
          : err?.data?.message || err?.error || "Could not create exhibition.";
        setStatus({ message: msg, type: "error" });
        toast.error(msg);
      }
    },
  });

  const inputClasses =
    "w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-11 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-violet-500/25 dark:focus:ring-white/20 focus:border-violet-400/60 dark:focus:border-white/40 outline-none";

  const labelClasses =
    "block text-xs font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-2 ml-1";

  const iconClasses =
    "absolute left-3.5 top-[38px] text-zinc-500 dark:text-zinc-600 h-5 w-5";

  const errorText = "text-rose-400 text-xs mt-1 ml-1";

  if (selectedIds.size === 0) {
    return (
      <div className="min-h-screen text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 pt-24">
        <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-sm dark:shadow-none">
          <Images className="w-12 h-12 text-zinc-500 mx-auto" />
          <h1 className="text-2xl font-light text-zinc-900 dark:text-white">
            No artworks selected
          </h1>
          <p className="text-zinc-600 dark:text-zinc-500 text-sm">
            Choose images for your exhibition on the curator-only selection
            page, then you can add title and dates here.
          </p>
          <Link
            to="/curator/select-exhibition-artworks"
            className="inline-flex items-center justify-center w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Select exhibition artworks
          </Link>
          <Link
            to="/"
            className="block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 pb-32 pt-24">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-2">
            Step 2 of 2
          </p>
          <h1 className="text-4xl font-light tracking-tighter text-zinc-900 dark:text-white">
            EXHIBITION <span className="font-serif italic">details</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-500 text-sm mt-2">
            {selectedIds.size} artwork{selectedIds.size === 1 ? "" : "s"}{" "}
            selected.
            <Link
              to="/curator/select-exhibition-artworks"
              state={{ artworkIds: [...selectedIds] }}
              className="text-violet-700 hover:text-violet-900 dark:text-white/80 dark:hover:text-white underline underline-offset-2 ml-2"
            >
              Change selection
            </Link>
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/30 p-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Selected images
          </p>
          {loadingArt ? (
            <div className="flex items-center gap-2 text-zinc-500 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading previews…
            </div>
          ) : artError ? (
            <p className="text-rose-400 text-sm">Could not load previews.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {selectedArtworks.map((art) => (
                <div
                  key={art._id}
                  className="flex-shrink-0 w-28 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50"
                >
                  <img
                    src={
                      art.image?.startsWith("http")
                        ? art.image
                        : `${imgBase}${art.image}`
                    }
                    alt=""
                    className="w-28 h-24 object-cover"
                  />
                  <div className="p-2">
                    <p className="text-[11px] font-medium text-zinc-900 dark:text-white line-clamp-2">
                      {artworkTitle(art)}
                    </p>
                    <p className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                      {artistLabel(art) || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-8 shadow-sm dark:shadow-none">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="relative">
              <label className={labelClasses}>Title</label>
              <Type className={iconClasses} />

              <input
                type="text"
                name="title"
                placeholder="Modern Art Expo"
                className={inputClasses}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.title}
              />

              {formik.touched.title && formik.errors.title && (
                <p className={errorText}>{formik.errors.title}</p>
              )}
            </div>

            <div className="relative">
              <label className={labelClasses}>Description</label>
              <AlignLeft className={iconClasses} />

              <textarea
                name="description"
                rows="3"
                placeholder="Describe the exhibition..."
                className={`${inputClasses} resize-none`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
              />

              {formik.touched.description && formik.errors.description && (
                <p className={errorText}>{formik.errors.description}</p>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 p-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="auctionEnabled"
                  checked={formik.values.auctionEnabled}
                  onChange={formik.handleChange}
                  className="mt-1 rounded border-zinc-400 text-violet-600 focus:ring-violet-500/30"
                />
                <span>
                  <span className="block text-sm font-medium text-zinc-900 dark:text-white">
                    Enable live auctions in the exhibition room
                  </span>
                  <span className="block text-xs text-zinc-600 dark:text-zinc-500 mt-1">
                    Bidders join in real time. If nobody outbids within 10 seconds
                    after the latest bid, that bidder wins the piece. Otherwise
                    bidding continues until the time limit you set (from the
                    first bid on each artwork).
                  </span>
                </span>
              </label>
              {formik.values.auctionEnabled && (
                <div className="relative pl-7">
                  <label className={labelClasses}>
                    Max bidding time per artwork (minutes)
                  </label>
                  <input
                    type="number"
                    name="auctionDurationMinutes"
                    min={1}
                    max={10080}
                    className={`${inputClasses.replace("px-11", "px-4")}`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.auctionDurationMinutes}
                  />
                  {formik.touched.auctionDurationMinutes &&
                    formik.errors.auctionDurationMinutes && (
                      <p className={errorText}>
                        {formik.errors.auctionDurationMinutes}
                      </p>
                    )}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className={labelClasses}>Start Date</label>
                <Calendar className={iconClasses} />

                <input
                  type="date"
                  name="startDate"
                  className={inputClasses}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.startDate}
                />

                {formik.touched.startDate && formik.errors.startDate && (
                  <p className={errorText}>{formik.errors.startDate}</p>
                )}
              </div>

              <div className="relative">
                <label className={labelClasses}>End Date</label>
                <Calendar className={iconClasses} />

                <input
                  type="date"
                  name="endDate"
                  className={inputClasses}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.endDate}
                />

                {formik.touched.endDate && formik.errors.endDate && (
                  <p className={errorText}>{formik.errors.endDate}</p>
                )}
              </div>
            </div>

            {status.message && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
                  status.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loadingArt}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  CREATE EXHIBITION
                  <Send size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExhibition;
