import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/APIErrors.js"
import {APIResponse} from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video is required!")
    }

    const getAllComments = Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId) 
            },
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as : "commenter"
            }
        },
        {
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likesOfComment"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size: "$likesOfComment"
                },
                commenter:{
                    $first: "$commenter"
                },

                isLiked:{
                    $cond:{
                        if:{
                            $in:[req.user?._id, "$likesOfComment.likedBy"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort:{
                createdAt: -1,
            }
        },
        {
            $project:{
                content:1,
                createdAt:1,
                likesCount:1,
                commenter:{
                    fullname:1,
                    username:1,
                    "avatar.url":1
                },
                isLiked: 1
            }
        }
    ])
    
    if(!getAllComments){
        throw new ApiError(500,"Something went wrong while fetching the comments")
    }

    // console.log(getAllComments);
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const comments = await Comment.aggregatePaginate(getAllComments, options)
    // console.log(comments.docs[0]);
    if(!comments){
        throw new ApiError(500,"Something went wrong while loading the comments")
    }

    return res
    .status(200)
    .json(new APIResponse(200, comments,"Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId} = req.params
    const {content} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Give valid video id")
    }

    if(!content){
        throw new ApiError(400, "Give content of video!")
    }

    const uploadComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if(!uploadComment){
        throw new ApiError(400, "Something went wrong while uploading on db")
    }

    return res
    .status(200)
    .json(new APIResponse(200, uploadComment, "Comment uploaded successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params
    const { content } = req.body

    if(!(isValidObjectId(commentId)) || !(content)){
        throw new ApiError(400, "Comment id not provided or content not provided")
    }

    const oldComment = await Comment.findById(commentId)

    if(req.user?._id.toString() !== oldComment?.owner.toString()){
        throw new ApiError(400,"Commentator did'nt match")
    }

    const updateComments = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content: content
            },
        },
        {
            new: true
        }
    )

    if(!updateComments){
        throw new ApiError(400, "Something went wrong while updating comment")
    }

    return res
    .status(200)
    .json(new APIResponse(200, updateComments, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params

    if(!(isValidObjectId(commentId))){
        throw new ApiError(400, "Comment id not provided")
    }

    const oldComment = await Comment.findById(commentId)

    if(req.user?._id.toString() !== oldComment?.owner.toString()){
        throw new ApiError(400,"Commentator did'nt match")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)
    // console.log(deleteComment);
    if(!deleteComment){
        throw new ApiError(400, "Something went wrong while deleting comment")
    }

    return res
    .status(200)
    .json(new APIResponse(200, deleteComment, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }