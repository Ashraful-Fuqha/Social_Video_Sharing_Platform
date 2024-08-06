/* eslint-disable no-unused-vars */
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../Slices/authSlice';


const baseQuery = fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000/api/v1/',
    //Whenever a new request is made through this url, the tokens are automatically attached to them for further validation
    //we are directly attaching the tokens from backend with http-only cookies we are'nt storing them anywhere not in localstorage,sessionstorage, in-memory, server
    credentials: 'include',
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // Handle re-authentication logic here
        const refreshResult = await baseQuery({
            url: '/users/refresh-token',
            method: 'POST',
        }, api, extraOptions);

        if (refreshResult.data) {
            // Retry the original query with the new token
            result = await baseQuery(args, api, extraOptions);
            console.log(result);
            
        } else {
            api.dispatch(logout());
        }
    }

    return result;
};

export default baseQueryWithReauth