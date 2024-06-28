import mongoose, { Schema } from "mongoose"
// import pkg from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
// const { jwt } = pkg;
const userSchema = new Schema(
  {
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "video",
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true, //for better search result
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true, //for better search result
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: { type: String },
    password: {
      type: String,
      required: [true, "password is Required"], //to handle errrors
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})
// return boolean value true , when password correct
userSchema.methods.isPasswordCorrect = async function(password){
  console.log(password)
  console.log(this.password)
  return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}
//methods
// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//       email: this.email,
//       userName: this.userName,
//       fullName: this.fullName,
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     {
//       expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
//     }
//   );
// };
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
  )
}
export const User = mongoose.model("User", userSchema)
//  export const {generateAccessToken:generateAccessToken,generateRefreshToken: generateRefreshToken,
  // isPasswordCorrect: isPasswordCorrect,}=userSchema.methods;