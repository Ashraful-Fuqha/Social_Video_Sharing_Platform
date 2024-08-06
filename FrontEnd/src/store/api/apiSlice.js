import {createApi} from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from './customBaseQuery'

export const apiSlice = createApi({
    reducerPath: "apiSlice",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getLoggedIn : builder.mutation({
            query: (body) => ({
                url: 'users/login/',
                method: 'POST',
                body
            })
        }),
        getRegistered: builder.mutation({
            query: (body) => ({
                url: 'users/register',
                method: 'POST',
                body
            }) 
        }),
        getAllVideos: builder.query({
            query: (query) => ({
                url: `videos/${" "||query}`,
                method: 'GET'
            })
        })
    })
})

export const {useGetLoggedInMutation, useGetRegisteredMutation, useGetAllVideosQuery} = apiSlice