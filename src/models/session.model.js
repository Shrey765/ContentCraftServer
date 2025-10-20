import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    title: {
        require: true,
        type: String,
    },
    type: {
        require: true,
        type: String,
    },
    tone: {
        require: true,
        type: String
    },
    keywords: {
        type: [String],
        default: []
    },
    constent: {
        type: String
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

export const Session = mongoose.model("Session", sessionSchema);