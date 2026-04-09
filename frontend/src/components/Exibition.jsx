import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Play, PlusCircle, Loader2 } from "lucide-react";
import { useGetExhibitionsQuery } from "../redux/api/exhibition.js";
import { artistLabel, artworkTitle } from "../utils/artworkMeta.js";

const imgBase = import.meta.env.VITE_BASE_URL ?? "";

function formatDateRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
  const opts = { month: "short", day: "numeric", year: "numeric" };
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}

function coverImage(ex) {
  const first = ex.artworkIds?.[0];
  if (first?.image) {
    const path = first.image.startsWith("http")
      ? first.image
      : `${imgBase}${first.image}`;
    return path;
  }
  return "https://images.unsplash.com/photo-1518998053901-5314c32943e6?auto=format&fit=crop&q=80&w=1200";
}

const Exibition = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isCurator = userInfo?.role === "curator";

  const { data, isLoading, isError } = useGetExhibitionsQuery();
  const exhibitions = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  return (
    <>
      <section
        className="py-32 px-6 bg-zinc-900/30 border-t border-white/5"
        id="exhibitions"
      >
        <div className="max-w-[90rem] mx-auto">
          <div className="flex flex-col items-center text-center mb-16 gap-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Curated Exhibitions
            </h2>
            <p className="text-white/60 text-lg font-light max-w-2xl">
              Step into scheduled, immersive virtual gallery spaces crafted by
              top curators.
            </p>
            {isCurator && (
              <Link
                to="/curator/select-exhibition-artworks"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add exhibition
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-zinc-500">
              <Loader2 className="w-10 h-10 animate-spin" />
              Loading exhibitions…
            </div>
          ) : isError ? (
            <p className="text-center text-rose-400/90 py-16">
              Could not load exhibitions. Check that the server is running.
            </p>
          ) : exhibitions.length === 0 ? (
            <p className="text-center text-white/50 py-16 border border-dashed border-white/10 rounded-2xl max-w-xl mx-auto">
              No exhibitions yet.
              {isCurator && (
                <>
                  {" "}
                  Create one with{" "}
                  <strong className="text-white/70">Add exhibition</strong>{" "}
                  above.
                </>
              )}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {exhibitions.map((ex) => {
                const curatorName = ex.curatorId?.username || "Curator";
                const dates = formatDateRange(ex.startDate, ex.endDate);
                const pieces = Array.isArray(ex.artworkIds) ? ex.artworkIds : [];

                return (
                  <article
                    key={ex._id}
                    className="group flex flex-col rounded-2xl border border-white/10 bg-zinc-950/80 overflow-hidden shadow-xl"
                  >
                    {/* Image area only — clip here */}
                    <div className="relative aspect-[16/9] overflow-hidden shrink-0">
                      <img
                        src={coverImage(ex)}
                        alt={ex.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        {dates && (
                          <span className="inline-block bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                            {dates}
                          </span>
                        )}
                        <h3 className="text-2xl md:text-3xl font-bold text-white">
                          {ex.title}
                        </h3>
                        <p className="text-white/75 text-sm mt-1">
                          Curated by {curatorName}
                        </p>
                      </div>
                    </div>

                    {/* Always-visible body: artwork list cannot be clipped */}
                    <div className="p-5 flex flex-col gap-4 flex-1 border-t border-white/10">
                      {pieces.length > 0 ? (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                            Artworks in this show
                          </p>
                          <ul className="space-y-2">
                            {pieces.slice(0, 8).map((a) => {
                              const who = artistLabel(a);
                              return (
                                <li
                                  key={a._id ?? String(a)}
                                  className="text-sm text-zinc-200 border-b border-white/5 pb-2 last:border-0 last:pb-0"
                                >
                                  <span className="text-white font-medium">
                                    {artworkTitle(a)}
                                  </span>
                                  {who ? (
                                    <span className="text-zinc-500">
                                      {" "}
                                      · {who}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-600 text-xs">
                                      {" "}
                                      · Artist
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                          {pieces.length > 8 && (
                            <p className="text-xs text-zinc-500 mt-2">
                              +{pieces.length - 8} more in the 3D room
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-500">No artworks linked.</p>
                      )}

                      <Link
                        to={`/exhibition/${ex._id}/room`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors w-full sm:w-auto"
                      >
                        <Play className="w-4 h-4" /> Enter 3D Room
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Exibition;
