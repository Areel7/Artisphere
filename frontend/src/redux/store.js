import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./features/auth/authSlice.js";
import artReducer from "./features/artwork/artSlice.js";
import { apiSlice } from "./api/apiSlice.js";


const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        artworks: artReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true,
});

setupListeners(store.dispatch);

export default store;