import mongoose from 'mongoose';
import { Template } from '../models/template.model.js';
// NOTE: Assuming your database connection utility is set up elsewhere
// import connectDB from '../db/connect.js'; 

// Import the auto-generated data array (You MUST update this path)

import initialTemplates from './seeders/reactions/yes_win_love.data.js'
/**
 * Parses the Cloudinary public ID to extract category and subCategory.
 * @param {string} publicId - e.g., 'mimi/reactions/Angry/template_name'
 * @returns {{category: string, subCategory: string}}
 */
const parseTemplatePath = (publicId) => {
    // Split the path by the slash delimiter
    const parts = publicId.split('/').filter(p => p); 
    
    // Logic: 
    // parts[0] is often the project root (e.g., 'mimi')
    // parts[1] is the category (e.g., 'reactions')
    // parts[2] is the subCategory (e.g., 'Angry')
    
    const category = 'Reaction';
    const subCategory = 'yes-win-love';

    return { category, subCategory };
};

const runTemplateSeeder = async () => {
    // 1. Ensure DB Connection is established (Omitted here, assumed in app entry point)
    // await connectDB(); 

    console.log(`\n--- Starting Template Seeder ---`);
    const totalTemplates = initialTemplates.length;
    let newInserts = 0;

    try {
        // Option 1: Clear the collection first (recommended for seeding)
        //await Template.deleteMany({});
        //console.log('Existing MemeTemplate collection cleared.');

        for (const template of initialTemplates) {
            // Check if a template with this unique ID already exists
            const existing = await Template.findOne({ templateId: template.templateId });
            
            if (existing) {
                console.log(`Skipping existing template: ${template.name}`);
                continue;
            }

            // --- DATA ENRICHMENT ---
            // 2. Derive Category and SubCategory from the public_id part of the imageUrl
            // Extract the relevant path from the URL
            const urlPath = new URL(template.imageUrl).pathname;
            
            // The public_id is typically the path component after 'upload/v[version]/'. 
            // We use the cleaned name for the parsing base if the full path isn't easy to extract
            // For simplicity, let's use the 'name' field and assume it contains the path info
            // NOTE: You must adjust the parsing source based on your generated data structure! 
            // We will use the template's 'name' as a proxy for the slug/path for now.
            
            // Revert to using the template's name field and hope the category is implicitly in there
            const pathInfo = parseTemplatePath(template.imageUrl); 

            // 3. Create the final document object
            const finalTemplate = {
                ...template,
                // Assign categories based on the derived path
                category: pathInfo.category, 
                subCategory: pathInfo.subCategory, 
            };
            
            // 4. Save the new template
            await Template.create(finalTemplate);
            newInserts++;
        }

        console.log(`\nSUCCESS: Seeded ${newInserts} of ${totalTemplates} templates into MongoDB.`);
    } catch (error) {
        console.error("FATAL ERROR during template seeding:", error);
    } finally {
        // Optional: Disconnect Mongoose after job completion
        mongoose.disconnect();
    }
};

// NOTE: This file should be executed via node once you have the final 'templates.data.js'
// runTemplateSeeder();

export default runTemplateSeeder;