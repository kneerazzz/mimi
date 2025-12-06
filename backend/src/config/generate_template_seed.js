import { getTemplatesForSeeding } from "../utils/cloudinary.util.js"
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// --- CONFIGURATION ---
// You MUST set this to the folder path where you uploaded your 1500+ templates
const CLOUDINARY_TEMPLATE_FOLDER = 'reactions/Sweat-Run-Away'; 
const OUTPUT_FILE_PATH = path.resolve('./src/db/seeders/reactions/sweat_run_away.data.js'); 
// -----------------------

// Helper function to capitalize the first letter of a string
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const generateTemplateSeedFile = async () => {
    try {
        console.log(`\n--- STARTING TEMPLATE DATA GENERATION ---`);
        console.log(`Fetching assets from Cloudinary folder: ${CLOUDINARY_TEMPLATE_FOLDER}`);

        // 1. Fetch raw template data from Cloudinary
        // Note: max_results is capped at 500 per call, adjust getTemplatesForSeeding 
        // to handle pagination if you have more than 500 templates.
        const rawTemplates = await getTemplatesForSeeding(CLOUDINARY_TEMPLATE_FOLDER);

        if (!rawTemplates || rawTemplates.length === 0) {
            console.error("No templates found in the specified Cloudinary folder.");
            return;
        }

        // 2. Map data to the final Mongoose schema structure
        const finalTemplateData = rawTemplates.map(asset => {
            
            // Generate a UUID for reliable, unique internal ID
            const templateUUID = uuidv4(); 
            
            // Clean up the name for the final display name
            const cleanedName = asset.name
                .split('-') // Split by dash/hyphen
                .map(word => capitalize(word))
                .join(' ');
            
            return {
                // Use UUID as the stable, unique template ID
                templateId: templateUUID, 
                
                // CRITICAL DATA
                imageUrl: asset.imageUrl,
                name: cleanedName.slice(0, Math.max(0, cleanedName.length-7)),
                
                // DATA TO BE FILLED MANUALLY LATER
                emotionTags: [],      // Empty, pending future AI tagging
                textRegions: [],      // Empty, pending manual definition (e.g., Top/Bottom coords)
                
                // STATIC DEFAULTS, 
                requiresAdvancedEditor: false,
                isUserSubmitted: true, // Assuming this is from your bulk user upload
            };
        });

        // 3. Format the data into a JavaScript file string
        const fileContent = `
/**
 * AUTO-GENERATED TEMPLATE SEED DATA
 * Total Templates: ${finalTemplateData.length}
 * Generated on: ${new Date().toISOString()}
 * * NOTE: 'emotionTags' and 'textRegions' MUST be populated manually 
 * or via the AI Tagger before AI Creation works.
 */
import { v4 as uuidv4 } from 'uuid';

const initialTemplates = ${JSON.stringify(finalTemplateData, null, 4)};

export default initialTemplates;
`;

        // 4. Write the content to the output file
        await fs.writeFile(OUTPUT_FILE_PATH, fileContent);

        console.log(`\nSUCCESS: Template seed data for ${finalTemplateData.length} templates has been written to ${OUTPUT_FILE_PATH}`);

    } catch (error) {
        console.error("FATAL ERROR during seed file generation:", error);
    }
};

// Execute the function
// NOTE: You would run this script via 'node generate_template_seed.js'
export default generateTemplateSeedFile;