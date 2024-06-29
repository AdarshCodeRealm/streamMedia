import mongoose,{Schema} from "mongoose";
import { Video } from "./video.model.js";
import { User } from "./user.model.js";
const playlistSchema = new Schema({

    name :{
        type : String,
        required :true
    },
    description :{
        type : String,
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: Video
     },
     owner:{
        type: Schema.Types.ObjectId,
        ref: User
     }

},{timestamps:true})
export const Playlist =mongoose.model("Playlist", playlistSchema)