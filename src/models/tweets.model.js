import mongoose,{Schema} from "mongoose";
import { Video } from "./video.model.js";
import { User } from "./user.model.js";
const tweetsSchema = new Schema({
    content :{
        type : String,
    },
   
     owner:{
        type: Schema.Types.ObjectId,
        ref: User
     }

},{timestamps:true})
export const Tweet = mongoose.model("Tweet", tweetsSchema)