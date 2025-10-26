import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        lowercase: true,
        unique: true,
        trim: true,
    },
    email: {
        required: true,
        type: String,
        lowercase: true,
        unique: true,
        trim: true
    },
    password: {
        required: [true, "Password is required"],
        type: String
    },
    name: {
        required: [true, "Name is Required"],
        type: String,
    },
    avatar: {
        type: String,
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = bcrypt.hash(this.password, 10);
        next()
    }
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(this.password, password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.name
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {_id: this.id,},
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);