import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/APIErrors.js"
import {APIResponse} from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(!(name && description)){
        throw new ApiError(400, "Please provide name and description of playlist")
    }

    const createNewPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!createNewPlaylist){
        throw new ApiError(400, "Error while creating playlist")
    }

    return res
    .status(200)
    .json(new APIResponse(200, createNewPlaylist, "New Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Please provide a user id")
    }

    const userPlaylist = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField : "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        {
            $addFields:{
                totalVideos: {
                    $size: "$videos"
                },
                totalViews:{
                    $sum: "$videos.views"
                }
            }
        },
        {
            $project:{
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1,
            }
        }
    ])

    if (!userPlaylist) {
        throw new ApiError(500, "Error while fetching the playlist");
    }

  return res
    .status(200)
    .json(new APIResponse(200, userPlaylist, "User playlist fetched successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Provide a valid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Playlist does'nt exists")
    }

    const videoPlaylist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlist)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as : "videos"
            }
        },
        {
            $match:{
                "videos.isPublished" : true 
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as : "owner"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos",
                },
                totalViews: {
                    $sum: "$videos.views",
                },
                owner: {
                    $first: "$owner",
                },
            },
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    "video.url": 1,
                    "thumbnail.url": 1,
                    title: 1,
                    description: 1,
                    createdAt: 1,
                    duration: 1,
                    views: 1,
                },
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                },
            },
        },
    ])

    if (!videoPlaylist) {
        throw new ApiError(500, "Error while fetching playlist videos");
    }
    console.log(videoPlaylist);

  return res
    .status(200)
    .json(
      new APIResponse(200, videoPlaylist, "Playlist fetched successfully")
    );
})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(isValidObjectId(playlistId) && isValidObjectId(videoId))){
        throw new ApiError(400, "Please provide playlist Id or video Id")
    }

    const video = await Video.findById(videoId)
    const playlist = await Playlist.findById(playlistId)

    if(!(video)){
        throw new ApiError(404,"Video didn't found")
    }

    if(!(playlist)){
        throw new ApiError(404,"playlist didn't found")
    }

    if(playlist.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "Only user can update the playlist")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if(!updatePlaylist){
        throw new ApiError(400, "Error while adding video to playlist")
    }

    return res
    .status(200)
    .json(new APIResponse(200, updatePlaylist, "Video added to playlist successfully"))


})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!(isValidObjectId(playlistId) && isValidObjectId(videoId))){
        throw new ApiError(400, "Please provide playlist Id or video Id")
    }

    const video = await Video.findById(videoId)
    const playlist = await Playlist.findById(playlistId)

    if(!(video && playlist)){
        throw new ApiError(404,"Video or playlist didn't found")
    }

    if(playlist.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "Only user can delete video from the playlist")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if(!updatePlaylist){
        throw new ApiError(400, "Error while removing video to playlist")
    }

    return res
    .status(200)
    .json(new APIResponse(200, updatePlaylist, "Video removed to playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Provide valid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    if (playlist.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You are not authorized to delete the playlist");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletedPlaylist) {
        throw new ApiError(500, "Server error while deleting playlist");
    }

    return res
    .status(200)
    .json(new APIResponse(200, deletedPlaylist, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!((name && description) || (isValidObjectId(playlistId)))){
        throw new ApiError(400, "Provide all fields and valid id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "No playlist found")
    }

    if (playlist.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You are not authorized to update the playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description,
            },
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(500, "Error while updating the playlist");
    }

    return res
        .status(200)
        .json(new APIResponse(200, updatedPlaylist, "Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}