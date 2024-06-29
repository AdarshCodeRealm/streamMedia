import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config({ path: ".env" })
const getUser = (req, res) => {
  const incomingAccessToken = req.cookies.accessToken
  if (!incomingAccessToken) {
    throw new ApiError(401, "unauthorized request")
  }

  const decodedToken = jwt.verify(
    incomingAccessToken,
    process.env.ACCESS_TOKEN_SECRET
  )
  return decodedToken
}
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination
  const videos = await Video.find({});
  if(!videos){
    throw new ApiError(404,"videos not found.")
  }
   return res
   .status(200)
   .json(
    new ApiResponse(
      200,
      videos,
      "all videos fetched successfully."
    )
   );



})

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body
    if (!title) return new ApiError(404, "video title is missing.")
    const videoPath = req.files.videoFile[0].path
    const thumbnailPath = req.files.thumbnail[0].path
    const videoResponse = await uploadOnCloudinary(videoPath)
    const thumbnailResponse = await uploadOnCloudinary(thumbnailPath)
    const owner = getUser(req)
    const video = await Video.create({
      title,
      description,
      videoFile: videoResponse.url,
      thumbnail: thumbnailResponse.url,
      owner,
      isPublished: true,
      duration: videoResponse.duration,
      view: 0,
    })
    return res
      .status(200)
      .json(new ApiResponse(200, video, "video url get success"))
  } catch (error) {
    console.log("failed to publish video. Error : ", error)
    throw error
  }
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id
  const video = await Video.findById(videoId)
  if (!video) {
    throw new ApiError(404, "failed ! video not found.")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched succesfully."))
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const video = await Video.findById(videoId)
  if(!video.owner.equals(req.user._id)){
    throw new ApiError(400,"unauthorized request.")
  }
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body

  const thumbnailResponse = await uploadOnCloudinary(req.file.path)

  if (title) video.title = title
  if (description) video.description = description
  if (thumbnailResponse) video.thumbnail = thumbnailResponse.url

  const response = await video.save()
  return res
    .status(200)
    .json(new ApiResponse(200, response, "video updated succesfully."))
})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: delete video
  const video = await Video.findById(videoId)
  if(!video.owner.equals(req.user._id)){
    throw new ApiError(400,"unauthorized request.")
  }
  const deletedVideo = await Video.findByIdAndDelete(videoId)
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid video ID"));
  }
  if (!deletedVideo) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Video not found or already deleted"))
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200, deletedVideo, "Video deleted successfully"
    ))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const video = await Video.findById(videoId)

  if(!video.owner.equals(req.user._id)){
    throw new ApiError(400,"unauthorized request.")
  }
  if (!video) {
    return new ApiError( 404, "Video not found" );
  }
  
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { isPublished:!video.isPublished }},
    { new: true } // Option to return the updated document
  
  );
  if(!updateVideo){
    throw new ApiError(400, "failed to update publish status.")
  }
  
  return res.status(200).json(
    new ApiResponse(
      200,
      updateVideo,
      ` publish status updated to ${video.isPublished? "public": "private"}.`
    )
  )
  }
)

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
}
