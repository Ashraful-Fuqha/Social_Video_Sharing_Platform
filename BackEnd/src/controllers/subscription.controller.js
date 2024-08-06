import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/APIErrors.js"
import {APIResponse} from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Provide valid channel id")
    }

    // Here the subscriber is found with match of channel in documents if found it means that this logged user is subscriber of visited channel, first we unsubscribe the channel i.e, delete the document and send unsubcribed successfully
    const isSubscriber = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    // console.log(isSubscriber);
    if(isSubscriber){
        //Unsubscribe i.e, delete the document
        await Subscription.findByIdAndDelete(isSubscriber._id)

        return res
        .status(200)
        .json(new APIResponse(200, {isSubscribed : false}, "Unsubscribed Successfully"))
    }

    //Here we create new subscription because we can't find the subscriber in the docs
    const newSubscriber  = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    if(!newSubscriber){
        throw new ApiError(400,"Error while subscribing the channel")
    }

    return res
    .status(200)
    .json(new APIResponse(200, {isSubscribed: true}, "Channel subscribed successfully"))
})

// controller to return, subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Provide a channel id")
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberOfChannel",
                pipeline:[
                    {
                        $lookup:{
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as : "subscribersOfSubscriber"
                        },
                    },
                    {
                        $addFields:{
                            subscribedToChannel:{
                                $cond:{
                                    if:{
                                        $in: [new mongoose.Types.ObjectId(channelId),
                                                {
                                                    $map: {
                                                        input: "$subscribersOfSubscriber",
                                                        as: "sub",
                                                        in: "$$sub.channel"
                                                    }
                                                }
                                            ]
                                    },
                                    then: true,
                                    else: false
                                }
                            },
                            subscribersCount: {
                                $size: "$subscribersOfSubscriber"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriberOfChannel"
        },
        {
            $project:{
                _id :0,
                subscriberOfChannel: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToChannel: 1,
                    subscribersCount: 1,
                }
            }
        }
    ])
    
    return res
    .status(200)
    .json(new APIResponse(200, subscriberList, "subscribers fetched successfully"));

})

// controller to return, channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Provide a valid Subscriber Id")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as : "channelsSubscribed",
                pipeline:[
                    {
                        $lookup:{
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as : "videos"
                        }
                    },
                    {
                        $addFields:{
                            lastVideo:{
                                $last: "$videos"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channelsSubscribed"
        },
        {
            $project: {
                _id: 0,
                channelsSubscribed: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    videos: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1,
                    },
                }
            }
        }
    ])

    if (!subscribedChannels) {
        throw new error(500, "Server error while fetching subscribed channels");
    }

    return res
    .status(200)
    .json(new APIResponse(200,subscribedChannels,"Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}