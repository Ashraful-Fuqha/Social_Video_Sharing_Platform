import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/APIErrors.js"
import {APIResponse} from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteImageFromCloudinary} from "../utils/fileUpload.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pipeline = []

    if(query){
        pipeline.push({
            $match:{
                title:{
                    $regex: query, //The title is fethced with the regex operation provided by the MONGODB and options are like case-sensitive,etc
                    $options : "im"
                }
            }
        })
    }
    //This pipeline is to fetch only those videos which are published
    pipeline.push({$match:{isPublished: true}})

    // sortType and sortBy are given by user via query
    // sortType can be title, views, createdAt, duration
    // sortBy can be asc or des

    if(sortBy && sortType){
        pipeline.push({
            $sort:{
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        }
        )
    } else {
        pipeline.push({ $sort: { createdAt : -1}})
    }

    pipeline.push({
        $lookup:{
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as :  "ownerDetails",
            pipeline : [
                {
                    $project:{
                        username : 1,
                        fullname: 1,
                        "avatar.url" : 1
                    }
                }
            ]
        }
    },
    {
        $unwind : "$ownerDetails"
    }
    )

    pipeline.push({
        $project:{
            "thumbnail.url" : 1,
            ownerDetails: 1,
            title: 1,
            description: 1,
            views: 1,
            createdAt: 1,
            duration:1
        }
    })
    const getVideos = Video.aggregate(pipeline)

    const options = {
        page : parseInt(page, 1),
        limit : parseInt(limit, 10)
    }

    const video = await Video.aggregatePaginate(getVideos, options)

    return res
    .status(200)
    .json(new APIResponse(200, video, "Videos fetched succesfully"))
})

const getAllVideosofAUser = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pipeline = [];

  if (!userId) {
    throw new ApiError(400, "User Id not provided");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User Id");
  }

  if (userId) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }
  if (query) {
    pipeline.push({
      $match: {
        title: {
          $regex: query,
          $options: "im",
        },
      },
    });
  }

  // fetch videos only that are set isPublished as true
  pipeline.push({ $match: { isPublished: true } });

  //sortBy can be views, createdAt, duration
  //sortType can be ascending(-1) or descending(1)
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerDetails",
    }
  );

  pipeline.push({
        $project:{
            "thumbnail.url" : 1,
            ownerDetails: 1,
            title: 1,
            description: 1,
            views: 1,
            createdAt: 1,
            duration:1
        }
  })

  const videoAggregate = Video.aggregate(pipeline);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const video = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new APIResponse(200, video, "Videos fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!(title && description)){
        throw new ApiError(400, "Give title and descriptions")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoFileLocalPath){
        throw new ApiError(404, "Video file is missing!")
    }

    if(!thumbnailLocalPath){
        throw new ApiError(404, "Thumbnail file is missing!")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)

    const uploadVideo = await Video.create({
        title,
        description,
        videoFile: {
            url: videoFile.url,
            publicId : videoFile.public_id
        },
        thumbnail: {
            url: thumbnailFile.url,
            publicId : thumbnailFile.public_id
        },
        owner: req.user?._id,
        duration: videoFile.duration,
    })

    if(!uploadVideo){
        throw new ApiError(400, "Something went wrong while uploading video to db!")
    }

    return res
    .status(200)
    .json(new APIResponse(200, uploadVideo, `${await updateVideo._id}`))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!(videoId) || !(isValidObjectId(videoId))){
        throw new ApiError(404, "Provide a valid videoID")
    }

    const video =  await Video.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField: "_id",
                foreignField: "video",
                as: "likesOfVideo"
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline:[
                    {
                        $lookup:{
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers",
                            },
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [req.user?._id, "$subscribers.subscriber"],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                        },
                    },
                    {
                        $project: {
                        username: 1,
                        "avatar.url": 1,
                        subscribersCount: 1,
                        isSubscribed: 1,
                        },
                    },
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likesOfVideo",
                },
                owner: {
                    $first: "$owner",
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likesOfVideo.likedBy"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
        $project: {
            "videoFile.url": 1,
            "thmbnail.url" : 1,
            title: 1,
            description: 1,
            views: 1,
            createdAt: 1,
            duration: 1,
            comments: 1,
            owner: 1,
            likesCount: 1,
            isLiked: 1,
        },
        },

    ])

    if (!video) {
        throw new ApiError(500, "failed to fetch video");
    }

    // increment views if video fetched successfully
    await Video.findByIdAndUpdate(videoId, {
        $inc: {
        views: 1,
        },
    });

    // add this video to user watch history
    await User.findByIdAndUpdate(req.user?._id, {
        $addToSet: {
            watchHistory: videoId,
        },
    });

    return res
        .status(200)
        .json(new APIResponse(200, video[0], "video details fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description, isPublished} = req.body
    let thumbnailLocalPath
    if(req.file.path){
        console.log(req.file);
        thumbnailLocalPath = req.file.path
    }//TODO: update video details like title, description, thumbnail

    if(!(videoId) || !(isValidObjectId(videoId))){
        throw new ApiError(404, "Provide a valid videoID")
    }

    if(!(title && description && isPublished)){
        throw new ApiError(200,"Provide a title or description")
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400,"Provide a thumbnail picture")
    }

    const oldVideo = await Video.findById(videoId)
    const oldThumbnailPublicID = oldVideo.thumbnail.publicId
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

     if (oldVideo.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You are not authorized to update the video");
    }

    if(!thumbnail.url){
        throw new ApiError(400,"Something went wrong while uploading thumbnail")
    }

    await deleteImageFromCloudinary(oldThumbnailPublicID)

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                isPublished,
                thumbnail:{
                    url : thumbnail.url,
                    publicId : thumbnail.public_id
                }
            }
        },
        {
            new:true
        }
    )

    if(!video){
        throw new ApiError(404, "Something went wrong while fetching and updating")
    }

    return res
    .status(200)
    .json(new APIResponse(200, video, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "VideoId is not valid")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video missing")
    }

    if (video.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You are not authorized to delete");
    }

    const deletedVideo = await Video.findByIdAndDelete(video)
    if (!deletedVideo) {
        throw new ApiError(500, "Error in  deleting the video");
    }

    await deleteImageFromCloudinary(video.videoFile.publicId)
    await deleteImageFromCloudinary(video.thumbnail.publicId)

    return res
    .status(200)
    .json(new APIResponse(200, deletedVideo, "Video deleted successfully"));

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
        if (!videoId) {
            throw new ApiError(400, "Video Id is not provided");
        }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const togglePublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished,
            },
        },
        { new: true }
    );

    if (!togglePublish) {
        throw new ApiError(500, "Unable to toggle the published section");
    }

    return res
        .status(200)
        .json(
        new APIResponse(200, togglePublish, "isPublished is successfully toggled")
        );
})

export {
    getAllVideos,
    getAllVideosofAUser,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}