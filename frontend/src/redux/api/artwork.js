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
    }),
    getAllArtworks: builder.query({
      query: () => ({
        url: ARTWORK_URL,
        method: "GET",
      }),
    }),
    getSingleArtwork: builder.query({
      query: (id) => ({
        url: `${ARTWORK_URL}/${id}`,
        method: "GET",
      }),
    }),
    updateArtwork: builder.mutation({
      query: ({ id, data }) => ({
        url: `${ARTWORK_URL}/update/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteArtwork: builder.mutation({
      query: (id) => ({
        url: `${ARTWORK_URL}/delete/${id}`,
        method: "DELETE",
      }),
    }),
    getArtworksbyArtistId: builder.query({
      query: (id) => ({
        url: `${ARTWORK_URL}/artist/${id}`,
        method: "GET",
      }),
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
