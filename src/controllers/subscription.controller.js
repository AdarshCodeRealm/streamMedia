import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { json } from "express"

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  // TODO: toggle subscription
  const subsciber = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  })
  return res.status(200).json(new ApiResponse(200, subsciber, "success"))
})

// controller to return subscriber list of a channel
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  const subscribersData = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },

    {
      $lookup: {
        from: "users", // Assuming users collection stores channel information
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
      },
    },
    {
      $unwind: "$subscriberInfo",
    },
    {
      $project: {
        _id: 0,
        channel: 1,
        subscriberInfo: {
          username: "$subscriberInfo.userName",
          name: "$subscriberInfo.fullName", // Assuming fullName stores full name
          avatar: "$subscriberInfo.avatar", // Assuming avatar stores avatar URL
        },
      },
    },
  ])
  return res.status(200).json(new ApiResponse(200, subscribersData, "success"))
})

// controller to return channel list to which user has subscribed
const  getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params


  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId), // Match subscriber document
      }
    },
    {
      $lookup: {
        from: "users", // Replace with your actual subscriptions collection name
        localField: "channel", // Use subscriber document's _id
        foreignField: "_id", // Replace with the field holding the subscriber's ID in subscriptions
        as: "channelInfo" // Alias for the lookup results
      }
    },
    {
      $unwind:  "$channelInfo",
     
    },
      {
        $project: {
          _id: 0,
          channel: 1,
          channelInfo: {
            username: "$channelInfo.userName",
            name: "$channelInfo.fullName", // Assuming fullName stores full name
            avatar: "$channelInfo.avatar", // Assuming avatar stores avatar URL
          },
        },
      },
  ]
  )
  return res.status(200).json(new ApiResponse(200, subscribedChannels, "succesfully getting a subscribed channels."))
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }
