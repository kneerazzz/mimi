import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    api_key: process.env.CLOUDINARY_API_KEY
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        const response = await cloudinary.uploader
            .upload(localFilePath, {
                resource_type: "auto"
        })
        console.log("file uploaded successfully")
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("Error in uploading files")
        return null;
    }
}

export default uploadOnCloudinary