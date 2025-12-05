import cloudinary from 'cloudinary';
import { ApiError } from './apiError.js';
import dotenv from 'dotenv'
import { CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY } from "../config/env.js"
dotenv.config({
    path: './.env'
})
// --- CLOUDINARY CONFIGURATION ---
// NOTE: Ensure your .env has CLOUDINARY_CLOUD_NAME, API_KEY, and API_SECRET
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

/*
 * NEW FUNCTION: Lists all assets in a specific folder and extracts their data.
 * @param {string} folderPath - The path to the folder where templates were uploaded (e.g., 'meme_templates').
 * @returns {Promise<Array<{templateId: string, imageUrl: string, emotionTags: string[]}>>} - Array of simplified template data.
 */
const getTemplatesForSeeding = async (folderPath) => {
    if (!folderPath) {
        throw new ApiError(400, "Cloudinary folder path is required for listing assets.");
    }
    try {
        // Use the Admin API to list resources in the folder
        const resources = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: folderPath, // Only look for assets starting with this path (the folder)
            max_results: 500, // Fetch up to 500 per call, can be paginated if needed
            // Include tags because the MediaFlow would have set them here
            tags: true,
        });

        // Map the results to the exact structure needed for your MongoDB seeding script
        const templateData = resources.resources.map(asset => ({
            // templateId is the public_id, removing the folder prefix for a cleaner slug
            templateId: asset.public_id.replace(`${folderPath}/`, ''), 
            imageUrl: asset.secure_url, // Use the secure HTTPS URL
            name: asset.public_id.split('/').pop().replace(/[-_]/g, ' '), // Cleaned name
            emotionTags: asset.tags || [], // Auto-generated tags
            
            // You will manually add textRegions in the final seed data
            textRegions: [],
            category: 'Reaction', // Default category
            isUserSubmitted: false, 
        }));

        console.log(`Successfully retrieved ${templateData.length} template assets from Cloudinary.`);
        return templateData;

    } catch (error) {
        console.error("Error listing resources from Cloudinary:", error.message);
        throw new ApiError(500, "Failed to connect to Cloudinary Admin API to list templates.");
    }
};


export { getTemplatesForSeeding };