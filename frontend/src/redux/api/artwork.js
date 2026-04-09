import { apiSlice } from "./apiSlice.js";
import { ARTWORK_URL } from "../constants.js";
import { UPLOAD_URL } from "../constants.js";

export const artworkApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createArtwork: builder.mutation({
      query: (data) => ({
        url: ARTWORK_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Artwork", id: "LIST" }],
    }),
    getAllArtworks: builder.query({
      query: () => ({
        url: ARTWORK_URL,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Artwork", id: _id })),
              { type: "Artwork", id: "LIST" },
            ]
          : [{ type: "Artwork", id: "LIST" }],
    }),
    getSingleArtwork: builder.query({
      query: (id) => ({
        url: `${ARTWORK_URL}/${id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "Artwork", id }],
    }),
    updateArtwork: builder.mutation({
      query: ({ id, data }) => ({
        url: `${ARTWORK_URL}/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Artwork", id },
        { type: "Artwork", id: "LIST" },
      ],
    }),
    deleteArtwork: builder.mutation({
      query: (id) => ({
        url: `${ARTWORK_URL}/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Artwork", id },
        { type: "Artwork", id: "LIST" },
      ],
    }),
    getArtworksbyArtistId: builder.query({
      query: (id) => ({
        url: `${ARTWORK_URL}/artist/${id}`,
        method: "GET",
      }),
      providesTags: [{ type: "Artwork", id: "LIST" }],
    }),
    uploadImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateArtworkMutation,
  useGetAllArtworksQuery,
  useGetSingleArtworkQuery,
  useUpdateArtworkMutation,
  useDeleteArtworkMutation,
  useGetArtworksbyArtistIdQuery,
  useUploadImageMutation,
} = artworkApiSlice;
