import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    type: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
}, {timestamps: true});

export const Image = mongoose.model("Image", imageSchema)