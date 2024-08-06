import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";

const initialState = {
    data: null,
    loading: false,
    error: null,
}

const contentSlice = createSlice({
    name: 'content',
    initialState,
    reducers: {
        contentReset: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(apiSlice.endpoints.getAllVideos.matchPending, (state) => {
            state.loading = true;
        });
        builder.addMatcher(apiSlice.endpoints.getAllVideos.matchFulfilled, (state, action) => {
            state.data = action.payload.data;
            state.loading = false;
        });
        builder.addMatcher(apiSlice.endpoints.getAllVideos.matchRejected, (state, action) => {
            state.loading = false;
            if (action.error instanceof Error) {
                state.error = action.error.message;
                console.log(action.error.message);
                
            } else {
                state.error = 'Failed to load videos';
            }
        });
    },
})

export const {contentReset} = contentSlice.actions;

export default contentSlice.reducer;