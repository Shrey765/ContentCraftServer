import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        require: true,
        type: String,
        lowercase: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        require: true,
        trype: String,
        lowercase: true,
        unique: true,
    },
    password: {
        require: [true, "Password is required"],
        type: String
    },
    name: {
        require: [true, "Name is Required"],
        type: String,
    },
    avatar: {
        type: String,
    }
}, {timestamps: true});

export const User = mongoose.model("User", userSchema);