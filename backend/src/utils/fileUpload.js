import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../config/env.js'

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_secret: CLOUDINARY_API_SECRET,
    api_key: CLOUDINARY_API_KEY
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