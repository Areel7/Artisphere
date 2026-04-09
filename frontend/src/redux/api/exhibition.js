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
  }),
});

export const {
  useCreateExhibitionMutation,
  useGetExhibitionsQuery,
  useGetExhibitionByIdQuery,
} = exhibitionApiSlice;
