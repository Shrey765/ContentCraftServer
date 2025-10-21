import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const database = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`mongodb connected !! DB Host ${database.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection error", error)
        process.exit(1);
    }
}

export default connectDB;