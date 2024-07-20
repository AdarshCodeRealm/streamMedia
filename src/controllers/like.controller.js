import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  const { videoId } = req.params

  const likedVideo = await Like.findOne({ video: videoId })
  if (likedVideo !=null) {
    await Like.findByIdAndDelete(likedVideo._id)
    return res
      .status(200)
      .json(new ApiResponse(200, likedVideo, "video unliked."))
  } else {
    const like = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    })
    return res.status(200).json(new ApiResponse(200, like, "video liked."))
  }
})

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.find({ likedBy: req.user._id })
  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "all liked videos."))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const alreadyLiked = await Like.findOne({ comment: commentId })

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id)
    return res
      .status(200)
      .json(new ApiResponse(200, alreadyLiked, "comment unliked."))
  } else {
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    })
    return res.status(200).json(new ApiResponse(200, like, "comment liked."))
  }
  //TODO: toggle like on comment
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  //TODO: toggle like on tweet
})

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos }
