import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    imageFile: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
}, {timestamps: true});

export const Image = mongoose.model("Image", imageSchema)