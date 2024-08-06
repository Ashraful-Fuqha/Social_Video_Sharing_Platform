import e from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from '../utils/APIErrors.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { APIResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken"
import ms from "ms"
import mongoose from "mongoose";

const registerUser = asyncHandler( async (req,res) => {
    //Get User details from frontend
    //Validation - not empty
    //check if user already exists through username and password
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    // return the response

    // Got Details
    const {fullname, email, password, username} = req.body;
    // console.log("Body  " ,req.body)

    //Validation
    if([fullname,email,password,username].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    } // No field is empty

    //Checking for user
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    //Reporting Error
    if(existedUser) throw new ApiError(409, "User with email or username already exits")

    //Got the local path of avatar, coverImage from Multer because it gives file access from frontend because it's called middleware as the body
    // console.log("Files : ",req)
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    //Got confirmation of avatar file
    if(!avatarLocalPath) throw new ApiError(400, "Avatar file is required")
    // if(!coverImageLocalPath) throw new ApiError(400, "CoverImage file required!")
    //The avatar image is uploaded to the cloudinary from local storage i.e, through multer
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //Checking for did avatar is successfully uplaoded on cloudinary
    if(!avatar) throw new ApiError(400, "Avatar file is required")

    //User created and entry opened in db
    const user = await User.create({
        fullname,
        avatar: {
            url: avatar.url,
            publicId: avatar.public_id
        },
        coverImage : {
            url: coverImage?.url,
            publicId: coverImage?.public_id
        },
        email,
        password,
        username : username.toLowerCase()

    })

    //Password and rerefreshTokns are eleminated
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500, "Something went wrong while registering user")

    // Response sent to frontend as body
    return res.status(201).json(
        new APIResponse(200, createdUser, "User successfully")
    )
})

const generateAccessTokenandRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        // console.log(accessToken,refreshToken)
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
    }
}

const loginUser = asyncHandler(async(req, res) => {
    //Take data from request body
    // give access based on username or email
    //find the user
    //Password check
    //Generate access and refresh token
    //send in the form of cookies the above tokens

    const {username, email, password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "Username or Email required!")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    }
    )

    if(!user){
        throw new ApiError(404,"User does not exists!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials")
    }

    const {accessToken,refreshToken} = await generateAccessTokenandRefreshToken(user._id)

    const loggerinuser = await User.findById(user._id).select("-password -refreshToken")

    const optionsAccessToken = {
        httpOnly : true,
        secure : true,
        sameSite: 'None',
        expires: new Date(Date.now() + ms(process.env.ACCESS_TOKEN_EXPIRY))
    }

    const optionsRefreshToken = {
        httpOnly : true,
        secure : true,
        sameSite: 'None',
        expires:  new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY))
    }

    return res
            .status(200)
            .cookie("accessToken", accessToken, optionsAccessToken)
            .cookie("refreshToken",refreshToken, optionsRefreshToken)
            .json(
                new APIResponse(
                    200,
                    {
                        user : loggerinuser
                    },
                    "User Logger In Successfully"
                )
            )
})

const logoutUser = asyncHandler(async(req, res) => {
    //We need a middleware because we don't have data about user i.e, is he authenticated? so we can do it by adding a middleware and it can be used multiple times anywhere.

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset :{
                refreshToken : 1 // this removes the field from the document
            }
        },
        {
            new : true
        }

    )
    
    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new APIResponse(200, {},"User Logged out!"))
})

const refreshAccesstoken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorised Access")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(400, "Invalid Refresh TOken")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or user")
        }

        const optionsAccessToken = {
            httpOnly : true,
            secure : true,
            sameSite: 'None',
            expires: new Date(Date.now() + ms(process.env.ACCESS_TOKEN_EXPIRY))
        }

        const optionsRefreshToken = {
            httpOnly : true,
            secure : true,
            sameSite: 'None',
            expires:  new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY))
        }
    
        const {accessToken, newRefreshToken} = await generateAccessTokenandRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, optionsAccessToken)
        .cookie("refreshToken", newRefreshToken, optionsRefreshToken)
        .json(
            new APIResponse(
                200, 
                "Access token refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid Refresh Token!")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})


    return res
        .status(200)
        .json(new APIResponse(
            200,
            {},
            "Password Updated Successfully!"
        ))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new APIResponse(200, req.user?._id, "Current User Fetched"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, email} = req.body

    if(!fullname || !email){
        throw new ApiError(404, "Fields Required!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
        ).select("-password")

    return res
    .status(200)
    .json(new APIResponse(
        200,
        user,
        "Account Details upated successfully"
    ))
})

const updateAvatarImage = asyncHandler(async(req, res) => {
    const avatarLocalPath =  req.file?.path
    // console.log(req.files)
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    // console.log(avatar)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar image on Cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: {
                    url: avatar.url,
                    publicId : avatar.public_id
                }
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new APIResponse(200, user, "Avatar uploaded successfully"))
})

const updatecoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "CoverImage file missing")
    }

    //Delete the old image avatar

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading cover image on Cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: {
                    url: coverImage.url,
                    publicId: coverImage.public_id
                }
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new APIResponse(200, user, "Cover uploaded successfully"))
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "Username Missing!")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                "avatar.url": 1,
                "coverImage.url": 1,
                email: 1,
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "Channel Doesn't Exits!")
    }

    return res
    .status(200)
    .json(new APIResponse(200, channel[0], "User channel fetched successfully"))
}) 

const getUserWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as : "watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        "avatar.url": 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new APIResponse(200, user[0].watchHistory, "Watch History Successfully Fetched"))
})
export {registerUser, loginUser, logoutUser, refreshAccesstoken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatarImage, updatecoverImage, getUserChannelProfile, getUserWatchHistory}