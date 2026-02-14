import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../config/env.js'

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_secret: CLOUDINARY_API_SECRET,
    api_key: CLOUDINARY_API_KEY
})

/**
 * Uploads a local file to Cloudinary
 * @param {string} localFilePath - Path to local file
 * @returns {Promise<Object|null>} - Cloudinary response or null
 */
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

/**
 * Uploads an image from a URL directly to Cloudinary (no local file needed)
 * Perfect for Reddit images - Cloudinary downloads and uploads automatically
 * @param {string} imageUrl - The Reddit image URL (e.g., https://i.redd.it/xxx.jpg)
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object|null>} - Cloudinary response with secure_url or null
 */
const uploadFromUrl = async (imageUrl, options = {}) => {
    try {
        const uploadOptions = {
            folder: options.folder || 'reddit-memes',
            resource_type: 'auto',
            // Add unique identifier based on URL to avoid duplicates
            public_id: options.public_id || undefined,
            // Optimize image automatically
            quality: 'auto',
            fetch_format: 'auto',
            ...options
        };

        const response = await cloudinary.uploader.upload_large(imageUrl, uploadOptions);
        
        
        return {
            url: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            width: response.width,
            height: response.height,
            bytes: response.bytes
        };
    } catch (error) {
        console.error(`✗ Cloudinary upload failed for ${imageUrl}: ${error.message}`);
        return null;
    }
}

/**
 * Uploads multiple images from URLs in batches to avoid rate limiting
 * @param {Array<string>} imageUrls - Array of image URLs
 * @param {number} batchSize - Number of concurrent uploads (default: 5)
 * @param {Object} options - Upload options for all images
 * @returns {Promise<Array>} - Array of {url, cloudinaryUrl, success} objects
 */
const uploadMultipleFromUrls = async (imageUrls, batchSize = 5, options = {}) => {
    const results = [];
    let successCount = 0;
    let failCount = 0;

    
    for (let i = 0; i < imageUrls.length; i += batchSize) {
        const batch = imageUrls.slice(i, i + batchSize);
        
        const batchResults = await Promise.all(
            batch.map(async (url) => {
                const result = await uploadFromUrl(url, options);
                
                if (result) {
                    successCount++;
                    return {
                        originalUrl: url,
                        cloudinaryUrl: result.url,
                        publicId: result.publicId,
                        success: true
                    };
                } else {
                    failCount++;
                    return {
                        originalUrl: url,
                        cloudinaryUrl: null,
                        success: false
                    };
                }
            })
        );
        
        results.push(...batchResults);
        
    }

    
    return results;
}

/**
 * Deletes an image from Cloudinary using its public_id
 * @param {string} publicId - The Cloudinary public_id
 * @returns {Promise<boolean>} - True if deleted successfully
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted from Cloudinary: ${publicId}`);
        return true;
    } catch (error) {
        console.error(`Failed to delete ${publicId}:`, error.message);
        return false;
    }
}

export { 
    uploadOnCloudinary, 
    uploadFromUrl, 
    uploadMultipleFromUrls,
    deleteFromCloudinary 
}

export default uploadOnCloudinary