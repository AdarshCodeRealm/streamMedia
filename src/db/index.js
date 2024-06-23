import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import dotenv from 'dotenv'


dotenv.config({path:'.env'})
const connectDB = async () => {
  try {
    const connectionPromise = await mongoose.connect(
      `${process.env.DB_URI}/${DB_NAME}`
    )
    console.log(
      "MongoDB connect successfully. run on host :",
      connectionPromise.connection.host
    )
  } catch (error) {
    console.log("MongoDB connection failed :", error)
  }
}
export default connectDB
