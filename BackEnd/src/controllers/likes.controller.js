import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.model.js"
import {ApiError} from "../utils/APIErrors.js"
import {APIResponse} from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Provide a valid video id")
    }

    const isVideoLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id 
    })

    // console.log(isVideoLiked);

    if(isVideoLiked){
        await Like.findByIdAndDelete(isVideoLiked._id)

        return res
        .status(200)
        .json(new APIResponse(200, {isLiked : false}, "Unliked successfully"))
    }

    const createVideoLike = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    }) 

    if(!createVideoLike){
        throw new ApiError(400, "Error while creating like doc")
    }

    return res
    .status(200)
    .json(new APIResponse(200, {isLiked: true}, "Liked video successfully" ))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Provide a valid comment id")
    }

    const isCommentLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id 
    })

    // console.log(isCommentLiked);

    if(isCommentLiked){
        await Like.findByIdAndDelete(isCommentLiked._id)

        return res
        .status(200)
        .json(new APIResponse(200, {isLiked : false}, "Unliked successfully"))
    }

    const createCommnetLike = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    }) 

    if(!createCommnetLike){
        throw new ApiError(400, "Error while creating like doc")
    }

    return res
    .status(200)
    .json(new APIResponse(200, {isLiked: true}, "Liked comment successfully" ))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Provide a valid tweet id")
    }

    const isTweetLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id 
    })

    // console.log(isTweetLiked);

    if(isTweetLiked){
        await Like.findByIdAndDelete(isTweetLiked._id)

        return res
        .status(200)
        .json(new APIResponse(200, {isLiked : false}, "Unliked successfully"))
    }

    const createTweetLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    }) 

    if(!createTweetLike){
        throw new ApiError(400, "Error while creating like doc")
    }

    return res
    .status(200)
    .json(new APIResponse(200, {isLiked: true}, "Liked tweet successfully" ))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const {_id: userObjectId} = req.user
    const userId = userObjectId.toString()

    console.log(userId);
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Provide a valid userdId")
    }

    const userLikedVideos = await Like.aggregate([
        {
            $match: {
              likedBy : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos",
                pipeline: [
                    {
                        $lookup:{
                            from : "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails"
                        }
                    },
                    {
                        $unwind: "$ownerDetails"
                    }

                ]
            }
        },
        {
            $unwind: "$likedVideos"
        },
        {
            $limit: 5
        },
        {
            $sort: {
                createdAt : -1
            }
        },
        {
            $project:{
                 _id: 0,
                likedVideos: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                    },
                },
            }
        }
    ])

    if(!userLikedVideos){
        throw new ApiError(400,"Error while fetching liked videos")
    }

    console.log(userLikedVideos);
    return res
    .status(200)
    .json(new APIResponse(200, userLikedVideos, "Liked Videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}