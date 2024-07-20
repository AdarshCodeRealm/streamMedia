import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const user = req.user._id
    const totalVideos = await Video.countDocuments({owner: user})
    const totalSubscribers = await Subscription.countDocuments({channel: user})
    const totalLikes = await Like.countDocuments({likedBy: user})
    return res
        .status(200)
        .json(new ApiResponse(200, {totalVideos, totalSubscribers, totalLikes}, "stats fetched succesfully."))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const user = req.user
    const videos = await Video.find({owner: user})
    if(!videos) throw new ApiError(404, "video not found")
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "video fetched succesfully."))
})

export {
    getChannelStats, 
    getChannelVideos
    }