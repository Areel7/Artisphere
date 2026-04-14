import { apiSlice } from "./apiSlice.js";
import { EXHIBITION_URL } from "../constants.js";

export const exhibitionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createExhibition: builder.mutation({
      query: (body) => ({
        url: EXHIBITION_URL,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Exhibition", id: "LIST" }],
    }),
    getExhibitions: builder.query({
      query: () => ({
        url: EXHIBITION_URL,
        method: "GET",
      }),
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Exhibition",
                id: _id,
              })),
              { type: "Exhibition", id: "LIST" },
            ]
          : [{ type: "Exhibition", id: "LIST" }],
    }),
    getExhibitionById: builder.query({
      query: (id) => ({
        url: `${EXHIBITION_URL}/${id}`,
        method: "GET",
      }),
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      providesTags: (_result, _err, id) => [{ type: "Exhibition", id }],
    }),
    getMyCuratorExhibitions: builder.query({
      query: () => ({
        url: `${EXHIBITION_URL}/my/exhibitions`,
        method: "GET",
      }),
      refetchOnMountOrArgChange: true,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Exhibition", id: _id })),
              { type: "Exhibition", id: "MY_LIST" },
            ]
          : [{ type: "Exhibition", id: "MY_LIST" }],
    }),
    deleteExhibition: builder.mutation({
      query: (id) => ({
        url: `${EXHIBITION_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "Exhibition", id },
        { type: "Exhibition", id: "LIST" },
        { type: "Exhibition", id: "MY_LIST" },
      ],
    }),
  }),
});

export const {
  useCreateExhibitionMutation,
  useGetExhibitionsQuery,
  useGetExhibitionByIdQuery,
  useGetMyCuratorExhibitionsQuery,
  useDeleteExhibitionMutation,
} = exhibitionApiSlice;
