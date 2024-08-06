import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./Slices/authSlice";
import dataSlice from "./Slices/dataSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./api/apiSlice";

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath] : apiSlice.reducer,
        auth: authSlice,
        content: dataSlice,
    },

    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch)

export default store;