import { apiSlice } from "./apiSlice";
import { USER_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/auth/login`,
        method: "POST",
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/auth/signup`,
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USER_URL}/auth/logout`,
        method: "POST",
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: `${USER_URL}/profile`,
        method: "GET",
      }),
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/profile_update`,
        method: "PUT",
        body: data,
      }),
    }),
    getArtists: builder.query({
      query: () => ({
        url: `${USER_URL}/artists`,
        method: "GET",
      }),
    }),
    getCurators: builder.query({
      query: () => ({
        url: `${USER_URL}/curators`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetArtistsQuery,
  useGetCuratorsQuery,
} = userApiSlice;
