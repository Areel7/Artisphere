import { apiSlice } from "./apiSlice";
import { ORDER_URL } from "../constants";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkoutOrder: builder.mutation({
      query: () => ({
        url: `${ORDER_URL}/checkout`,
        method: "POST",
      }),
      invalidatesTags: ["Cart", "Order"],
    }),
    getUserOrders: builder.query({
      query: () => ({
        url: `${ORDER_URL}`,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),
  }),
});

export const { useCheckoutOrderMutation, useGetUserOrdersQuery } = orderApiSlice;
