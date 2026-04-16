import { apiSlice } from "./apiSlice.js";
import { ADMIN_URL } from "../constants.js";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query({
      query: () => ({
        url: `${ADMIN_URL}/users`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((u) => ({ type: "User", id: u._id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    createAdminUser: builder.mutation({
      query: (body) => ({
        url: `${ADMIN_URL}/users`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    deleteAdminUser: builder.mutation({
      query: (id) => ({
        url: `${ADMIN_URL}/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    patchAdminUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `${ADMIN_URL}/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
    getAdminOrders: builder.query({
      query: () => ({
        url: `${ADMIN_URL}/orders`,
        method: "GET",
      }),
      providesTags: [{ type: "Order", id: "LIST" }],
    }),
    updateAdminExhibition: builder.mutation({
      query: ({ id, body }) => ({
        url: `${ADMIN_URL}/exhibitions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Exhibition", id },
        { type: "Exhibition", id: "LIST" },
        { type: "Exhibition", id: "MY_LIST" },
      ],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  usePatchAdminUserRoleMutation,
  useGetAdminOrdersQuery,
  useUpdateAdminExhibitionMutation,
} = adminApiSlice;
