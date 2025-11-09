import { User } from "../src/models/user.model.js";
import jwt from 'jsonwebtoken'
import uploadOnCloudinary from "../src/services/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
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

        //file upload
        const localFilePath = req.file?.avatar?.path;
        console.log(localFilePath);

        if(!localFilePath){
            console.log("avatar image is not uploaded");
        }

        const imageUrl = localFilePath ? await uploadOnCloudinary(localFilePath) : "";
        if(!imageUrl){
            console.log("cloudinary didn't responded with the image url")
        }
        
        //create User 
        const user = await User.create({
            username: username.toLowerCase(),
            email: email,
            name: name,
            password: password,
            avatar: imageUrl?.url || "",
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

    if(!(username || email)){
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

    console.log(password)

    const actualUser = await present.isPasswordCorrect(password);
    if(!actualUser){
        return res.status(401).json({
            error: "invalid password"
        })
    }

    //generateAccessAndRefreshToken
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(present._id)

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
    .json({
        user: loggedInUser, 
        accessToken, 
        refreshToken,
        message: "User logged in Successfully"
    })
}

const logoutUser = async (req, res) => {
    const id = req.user._id;

    const user = User.findByIdAndUpdate(
        id,
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

const refreshAccessToken = async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    console.log(incommingRefreshToken)

    if(!incommingRefreshToken){
        return res.status(401).json(
            {message: "unauthorized request"}
        )
    }

    const decodedToken = jwt.verify(
        incommingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )    

    const user = await User.findById(decodedToken?._id)

    if(!user){
        return res.status(401).json(
            {message: "invalid refresh token"}
        )
    }

    if(incommingRefreshToken !== user?.refreshToken){
        return res.status(401).json(
            {message: "Refresh token is expired"}
        );
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        {
           accessToken,
           newRefreshToken,
           message: "access token is refreshed"
        }
    )
}

const updatePassword = async (req, res) => {
    const id = req.user._id;
    const {newPassword} = req.body;

    if(!newPassword || typeof newPassword !== "string" || newPassword.trim() === ""){
        return res
        .status(400)
        .json(
            {error: "new password is not valid or given"}
        )
    }

    const user = await User.findById(id)
    if(!user){
        return res
        .status(404)
        .json(
            {error: "User not found"}
        );
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(400)
    .json(
        {message: "password is updated"}
    )
}

const editDetails = async (req, res) => {
    try {
        const {name, email, username} = req.body;
        const id = req.user._id;
    
        if(!name && !email && !username){
            return res
            .status(500)
            .json({message: "no value given to update"})
        }
    
        const user = await User.findById(id);
        
        if(name){
            user.name = name;
        }
    
        if(email){
            const exists = await User.findOne({ email, _id: { $ne: id } });
            if (exists) return res.status(409).json({ error: "Email already in use" });
        }
    
        if(username){
            const exists = await User.findOne({ username, _id: { $ne: id } });
            if (exists) return res.status(409).json({ error: "Username already in use" });
        }
        const update={}
        if (name) update.name = name;
        if (email) update.email = email;
        if (username) update.username = username;
    
        const updated = await User.findByIdAndUpdate(id, { $set: update }, { new: true })
          .select("-password -refreshToken");
    
        return res
        .status(200)
        .json({
            message: "user details are updated",
            user: updated
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error while updating details" });
    }
}

const updateAvatar = async (req, res) => {
    try {
        const localFilePath = req.file?.avatar?.path;
    
        if(!localFilePath){
            return res
            .status(400)
            .json(
                {message: "localFile path missing!!"}
            );
        }
    
        const avatar = await uploadOnCloudinary(localFilePath);
    
        if(!avatar){
            return res
            .status(500)
            .json({message: "Error while udating avatar image"})
        }
    
        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set: {avatar: avatar ? avatar.url : ""}
            },
            {new: true}
        ).select("-password -refreshToken");
    
    
        return res
        .status(200)
        .json({
            message: "avatar image updated",
            avatar: user.avatar,
            user
        });
    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json({
            error: "Server error while upddating avatar"
        });
    }
};

export {registerUser, loginUser, logoutUser, refreshAccessToken, updatePassword, updateAvatar, editDetails};