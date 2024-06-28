import mongoose,{Schema, mongo} from "mongoose";
import { Comment } from "./comment.model.js";
import { Video } from "./video.model.js";
import { User } from "./user.model.js";
const likesSchema = new Schema({

     comment: {
        type: Schema.Types.ObjectId,
        ref: Comment
     },
     video:{
        type: Schema.Types.ObjectId,
        ref: Video
     },
     likedBy:{
        type: Schema.Types.ObjectId,
        ref: User
     },
     tweet: {
        type: Schema.Types.ObjectId,
        ref: Tweet
     }

},{ timestamps:true})
export const Like = mongoose.model("Like", likesSchema)