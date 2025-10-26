import { User } from "../src/models/user.model.js";

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

export {registerUser};