import { apiSlice } from "./apiSlice";
import { REQUEST_URL } from "../constants";

export const requestApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createRequest: builder.mutation({
            query: (data) => ({
                url: `${REQUEST_URL}`,
                method: "POST",
                body: data,
            }),
        }),
        getRequests: builder.query({
            query: () => ({
                url: `${REQUEST_URL}`,
                method: "GET",
            }),
        }),
        approveRequest: builder.mutation({
            query: (data) => ({
                url: `${REQUEST_URL}/approve`,
                method: "PUT",
                body: data,
            }),
        }),
    }),
});

export const {
    useCreateRequestMutation,
    useGetRequestsQuery,
    useApproveRequestMutation,
} = requestApiSlice;