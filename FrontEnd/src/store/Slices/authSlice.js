import { createSlice } from "@reduxjs/toolkit"
import { apiSlice } from "../api/apiSlice";

const initialState = {
    isLoggedIn: false,
    user: null,
    error: null,
    loading: false,
    success: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
            // state.token = null;
            // state.refreshToken = null
            state.success = false;
        },
        RevertSuccess: (state) => {
            state.success = false;
        },
        ClearError: (state) => {
            state.error = null;
        },
        SetError: (state, action) => {
            state.error = action.payload.error;
        },
    },
    extraReducers: (builder) => {
        //Login user
        builder.addMatcher(apiSlice.endpoints.getLoggedIn.matchPending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addMatcher(apiSlice.endpoints.getLoggedIn.matchFulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.isLoggedIn = true;
            state.user = action.payload.user;
            // state.token = action.payload.data.accessToken;
            // state.refreshToken = action.payload.data.refreshToken
        });
        builder.addMatcher(apiSlice.endpoints.getLoggedIn.matchRejected, (state, action) => {
            state.loading = false;
            if (action.error instanceof Error) {
                state.error = action.error.message;
            } else {
                state.error = 'Failed to log into your account.';
            }
        });

        //register user
        builder.addMatcher(apiSlice.endpoints.getRegistered.matchPending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addMatcher(apiSlice.endpoints.getRegistered.matchFulfilled, (state) => {
            state.loading = false;
            state.success = true;
        });
        builder.addMatcher(apiSlice.endpoints.getRegistered.matchRejected, (state, action) => {
            state.loading = false;
            if (action.error instanceof Error) {
                state.error = action.error.message;
            } else {
                state.error = 'Failed to register your account';
            }
        });
    }
}) 

export const {
    logout,
    tokenUpdated,
    RevertSuccess,
    ClearError,
    SetError
} = authSlice.actions

export default authSlice.reducer