import mongoose, { isValidObjectId } from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id; // auth middleware provides req.user

  // Check if a subscription already exists
  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    // If subscription exists, delete it (unsubscribe)
    await Subscription.deleteOne({
      subscriber: userId,
      channel: channelId,
    });
    return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  } else {
    // If no subscription exists, create one (subscribe)
    const newSubscription = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });
    return res.status(200).json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
  }
});


const  getUserChannelSubscribers= asyncHandler(async (req, res) => {
  const { channelId } = req.params
  const subscribersData = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },

    {
      $lookup: {
        from: "users", 
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
          name: "$subscriberInfo.fullName",
          avatar: "$subscriberInfo.avatar", 
        },
      },
    },
  ])
  return res.status(200).json(new ApiResponse(200, subscribersData, "success"))
})

// controller to return channel list to which user has subscribed
const  getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  const subscribedChannelsData = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId), 
      }
    },
    {
      $lookup: {
        from: "users", 
        localField: "channel", 
        foreignField: "_id", 
        as: "channelInfo" 
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
            name: "$channelInfo.fullName", 
            avatar: "$channelInfo.avatar",
          },
        },
      },
  ]
  )
  return res.status(200).json(new ApiResponse(200, subscribedChannelsData, "succesfully getting a subscribed channels."))
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }
