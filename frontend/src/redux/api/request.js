import { apiSlice } from "./apiSlice";
import { REQUEST_URL } from "../constants";

export const requestApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public — no credentials required
    createRequest: builder.mutation({
      query: (data) => ({
        url: `${REQUEST_URL}`,
        method: "POST",
        body: data,
      }),
    }),
    // Superadmin only
    getRequests: builder.query({
      query: () => ({
        url: `${REQUEST_URL}`,
        method: "GET",
      }),
      providesTags: [{ type: "Request", id: "LIST" }],
    }),
    approveRequest: builder.mutation({
      query: (id) => ({
        url: `${REQUEST_URL}/approve/${id}`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Request", id: "LIST" }],
    }),
    rejectRequest: builder.mutation({
      query: (id) => ({
        url: `${REQUEST_URL}/reject/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Request", id: "LIST" }],
    }),
    // Protected — logged-in visitor applies from their profile
    applyAsRole: builder.mutation({
      query: (role) => ({
        url: `${REQUEST_URL}/apply`,
        method: "POST",
        body: { role },
      }),
    }),
  }),
});

export const {
  useCreateRequestMutation,
  useGetRequestsQuery,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useApplyAsRoleMutation,
} = requestApiSlice;