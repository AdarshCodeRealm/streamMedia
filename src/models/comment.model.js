import mongoose,{Schema} from "mongoose";
import { Video } from "./video.model";
import { User } from "./user.model";
const commentSchema = new Schema({

    content :{
        type:String,
        required:true,
    } ,
    video:{
        type:Schema.Types.ObjectId,
        ref:Video,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:User,
        required:true
    }

},{timestamps})
export const Comment = mongoose.model("Comment",commentSchema) 