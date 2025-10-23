import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloudinary = async (imageUrl) => {
    try {
        if(!imageUrl) return null;

        const response = await cloudinary.uploader(imageUrl, {
            resource_type: "auto"
        })

        console.log("file is uploaded on cloudinary!");
        console.log(response);

        return response;
    } catch (error) {
        console.log("Error occured during image upload !", error)

        return null;
    }
}

export default uploadOnCloudinary;