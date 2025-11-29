import {v2 as cloudinary} from 'cloudinary'
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../config/env.js'
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_secret: CLOUDINARY_API_SECRET,
    api_key: CLOUDINARY_API_KEY
})

function extractPublicId(cloudinarUrl) {
    const urlParts = cloudinarUrl.split("/")
    const fileName = urlParts.pop().split(".")[0]
    const folderPath = urlParts.slice(urlParts.indexOf("upload") + 1).join("/")
    return `${folderPath}/${fileName}`
}

const deleteFromCloudinary = async(url) => {
    try {
        const publicId = extractPublicId(url)
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        })
        console.log("file deleted successfully", result)
        return result;
    } catch (error) {
        console.log("Error removing files from cloudinary")
        return null;
    }
}

export default deleteFromCloudinary;