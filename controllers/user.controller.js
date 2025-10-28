import { User } from "../src/models/user.model.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something wend wrong while generating access token and refresh Token"
        })
    }
}

const registerUser = async (req, res) => {
    try {
        const {username, email, password, name} = req.body;
        console.log(username)
        console.log(email)
        console.log(password)
        console.log(name)

        //validate user details
        const missing = [username, email, password, name].some(
            (field) => !field || (typeof field === "string" && field.trim() === "")
        );

        if(missing){
            return res.status(400).json(
                {error: "All fields are required."}
            );
        }
        
        //find existing user if present
        const existingUser = await User.findOne({
            $or : [{email}, {username}]
        });

        if(existingUser){
            return res.status(409).json(
                {error: "Already Existing username or email"}
            )
        }
        
        //create User 
        const user = await User.create({
            username: username.toLowerCase(),
            email: email,
            name: name,
            password: password
        })

        //check if user is created or not 
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            return res.status(500).json(
                {error: "error occured while creating the user"}
            )
        }

        //return the success respoce
        return res.status(200).json({
                    message: "User registered successfully",
                    user: createdUser,
                    });

    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {error: "Server error while registering the user"}
        );
    }
}

const loginUser = async (req, res) => {
    const {email, username, password} = req.body;

    if(!email || !username){
        return res.status(400).json(
            {error: "email or username is required to login"}
        )
    }

    const present = await User.findOne({
        $or : [{email}, {username}]
    });
    if(!present){
        return res.status(404).json(
            {error: "invalid username/email"}
        )
    }

    const actualUser = present.isPasswordCorrect(password);
    if(!actualUser){
        return res.status(401).json({
            error: "invalid password"
        })
    }

    //generateAccessAndRefreshToken
    const {accessToken, refreshToken} = generateAccessAndRefreshToken(present._id)

    const loggedInUser = await User.findById(present._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        {user: loggedInUser, accessToken, refreshToken},
        {message: "User logged in Successfully"}
    )
}

const logoutUser = async (req, res) => {
    const id = req.user._id;

    const user = User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined,}
        },
        {new: true}
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
        message: "User logged Out"
    });

}

export {registerUser, loginUser, logoutUser};