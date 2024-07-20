import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required")
  }
  const playlist = new Playlist({
    name,
    description,
    owner: req.user._id,
  })
  await playlist.save()
  res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params

  // Validate userId
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID")
  }

  // Fetch playlists belonging to the user
  const playlists = await Playlist.find({
    owner: userId,
  }).select("-__v") // Exclude the __v field from the results, assuming you don't want to send it to the client

  // Check if playlists were found
  if (!playlists.length) {
    throw new ApiError(404, "No playlists found for this user")
  }

  // Send success response with playlists
  res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID")
  }
  const playlist = await Playlist.findById(playlistId).select("-__v")
  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  const playlistData = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId), // Correctly instantiate ObjectId here
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
  ]
  const result = await Playlist.aggregate(playlistData).exec()

  res
    .status(200)
    .json(new ApiResponse(200, result, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID")
  }
  const playlist = await Playlist.findById(playlistId)
  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }
  const existingVideos = await Playlist.findOne({
    _id: playlistId,
    video: videoId, // Assuming 'video' is the field name in your Playlist schema that stores video IDs
  })
  if (existingVideos) {
    throw new ApiError(400, "Video already exists in playlist")
  }
  await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { video: videoId },
    },
    { new: true }
  )

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID")
  }
  const playlist = await Playlist.findById(playlistId)
  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }
  const videoExist = await Playlist.findOne({
    _id: playlistId,
    video: videoId, // Assuming 'video' is the field name in your Playlist schema that stores video IDs
  })
  if(!videoExist) {
    throw new ApiError(400, "Video does not exist in playlist")
  }
  const result = await Playlist.updateOne(
    { _id: playlistId },
    { $pull: { video: videoId } }
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params

  // Validate playlistId
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID")
  }

  // Find and delete the playlist by ID
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

  if (!deletedPlaylist) {
    throw new ApiError(404, "Playlist not found")
  }

  // Send success response
  res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  const { name, description } = req.body
if(!(name || description)) {
  throw new ApiError(400, "Please provide name and description")
}
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID")
  }

  // Find the playlist by ID and update it
  const playlist = await Playlist.findByIdAndUpdate(playlistId, {
    $set: {
      name,
      description,
    },
    new: true, // This option returns the updated document
  })

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  // Send success response with the updated playlist
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"))
})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
}
