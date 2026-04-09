import { apiSlice } from "./apiSlice";
import { FAVORITE_URL } from "../constants";

export const favoriteApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query({
      query: () => ({
        url: `${FAVORITE_URL}`,
        method: "GET",
      }),
      providesTags: ["Favorite"],
    }),
    addFavorite: builder.mutation({
      query: (data) => ({
        url: `${FAVORITE_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Favorite"],
    }),
    removeFavorite: builder.mutation({
      query: (data) => ({
        url: `${FAVORITE_URL}`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["Favorite"],
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoriteApiSlice;
