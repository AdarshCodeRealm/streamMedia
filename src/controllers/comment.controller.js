import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query
  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId), // Filter comments by video ID
      },
    },
    {
      $lookup: {
        from: "users", // Assuming 'users' is the name of the User collection in MongoDB
        localField: "owner", // Field in Comment that references User
        foreignField: "_id", // Field in User that matches the localField
        as: "ownerDetails", // Output array field
      },
    },
    {
      $unwind: "$ownerDetails", // Deconstruct the ownerDetails array to output documents
    },
    {
      $project: {
        _id: 1, // Include comment's _id
        content: 1, // Include comment's content
        createdAt: 1, // Include comment's creation date (assuming you have this field)
        "ownerDetails.avatar": 1, // Include owner's avatar
        "ownerDetails.userName": 1, // Include owner's username
        "ownerDetails.fullName": 1, // Include owner's full name
        // Add any other fields you need from the Comment or User documents
      },
    },
    {
      $skip: parseInt((page - 1) * limit), // Pagination: Skip documents
    },
    {
      $limit: parseInt(limit), // Pagination: Limit documents
    },
  ])
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "comments fetched successfully."))
})

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params
  const { message } = req.body
  const comment = await Comment.create({
    content: message,
    video: videoId,
    owner: req.user._id,
  })
  return res.status(200).json(new ApiResponse(200, comment, message))
})

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params
  const { message } = req.body
  const comment = await Comment.findByIdAndUpdate(commentId, {
    content: message,
  })
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated successfully."))
})

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params
  const comment = await Comment.findByIdAndDelete(commentId)
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment deleted successfully."))
})

export { getVideoComments, addComment, updateComment, deleteComment }
