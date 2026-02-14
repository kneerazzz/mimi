import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateMemeContext } from "../utils/geminiResponse.js";
import { Template } from "../models/template.model.js";
import { CreatedMeme } from "../models/createdMeme.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/fileUpload.js";// Adjust path if needed
import deleteFromCloudinary from "../utils/fileDelete.js";
import { UserTemplate } from "../models/user.template.model.js";
// Helper function used across controllers
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Helper to safely parse JSON from FormData
const safeParseJSON = (data, fallback = []) => {
    if (!data) return fallback;
    if (typeof data === "string") {
        try { return JSON.parse(data); } catch (e) { return fallback; }
    }
    return data;
};

// --------------------------------------------------------
// 1. PREVIEW MEME (AI)
// --------------------------------------------------------
const previewMeme = asyncHandler(async(req, res) => {
    const { context } = req.body;
    const user = req.user;
    if(!context){
        throw new ApiError(400, "Context field can't be empty")
    }
    if(!user.is_registered){
        throw new ApiError(401, "Login required for this feature!")
    }
    const {emotionTags, caption} = await generateMemeContext(context);

    const templates = await Template.find({
        emotionTags: {$in: emotionTags}
    }).limit(20)

    if(!templates || templates.length === 0){
        throw new ApiError(404, "No templates found for this context!")
    }

    const allowedPositions = ["Top", "Left", "Right", "Bottom", "Custom"];

    const previews = templates.map(template => {
        const hasRegions = Array.isArray(template.textRegions) && template.textRegions.length > 0;
        const textLayers = hasRegions
            ? template.textRegions.map(region => ({
                text: caption,
                position: allowedPositions.includes(region.position) ? region.position : "Custom",
                size: region.size || 24,
                fontColor: region.fontColor || "#FFFFFF",
                strokeColor: region.strokeColor || "#000000",
                fontFamily: region.fontFamily || "Impact",
                textAlign: region.textAlign || "center",
                isBold: true,
                isItalic: false,
                lineHeight: 1.2,
                x: region.x ?? 50,
                y: region.y ?? 10,
                layerWidth: region.layerWidth ?? 90
            }))
            : [{
                text: caption,
                position: "Top",
                size: 24,
                fontColor: "#FFFFFF",
                strokeColor: "#000000",
                fontFamily: "Impact",
                textAlign: "center",
                isBold: true,
                isItalic: false,
                lineHeight: 1.2,
                x: 50,
                y: 10,
                layerWidth: 90
            }];

        return {
            templateId: template._id,
            templateUrl: template.imageUrl,
            textLayers,
            constraints: { x: [0, 100], y: [0, 100], size: [10, 100], layerWidth: [10, 100] }
        };
    });

    return res.status(200).json(
        new ApiResponse(200, { caption, emotionTags, previews }, "Preview is ready")
    )
})

// --------------------------------------------------------
// 2. CREATE MEME WITH AI
// --------------------------------------------------------
const createMemeWithAI = asyncHandler(async(req, res) => {
    const user = req.user;
    if(user.is_registered === false) throw new ApiError(401, "Login required")
    
    // Grab file from Multer
    const localFilePath = req.file?.path;
    if (!localFilePath) throw new ApiError(400, "Meme image file is required");

    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    if (!cloudinaryResponse) throw new ApiError(500, "Failed to upload to Cloudinary");
    const finalImageUrl = cloudinaryResponse.secure_url;

    const { templateId, originalScenario } = req.body; 
    const parsedTextLayers = safeParseJSON(req.body.textLayers);
    const parsedTags = safeParseJSON(req.body.tags);

    if (parsedTextLayers.length === 0) throw new ApiError(400, "textLayers required");

    const template = await Template.findById(templateId)
    if(!template) throw new ApiError(404, "Template Not found")

    const safeTextLayers = parsedTextLayers.map(layer => ({
        ...layer,
        x: clamp(Number(layer.x) ?? 50, 0, 100),
        y: clamp(Number(layer.y) ?? 10, 0, 100),
        size: clamp(Number(layer.size) ?? 24, 10, 100),
        layerWidth: clamp(Number(layer.layerWidth) ?? 90, 10, 100),
    }));

    const safeTags = parsedTags.map(t => String(t).toLowerCase());

    const meme = await CreatedMeme.create({
        creator: user._id,
        template: templateId,
        finalImageUrl: finalImageUrl, // Use the uploaded URL
        isAIGenerated: true,
        originalScenario: originalScenario || "",
        textLayers: safeTextLayers,
        tags: safeTags
    })

    return res.status(200).json(new ApiResponse(200, meme, "AI Meme created successfully"))
})

// --------------------------------------------------------
// 3. CREATE MEME MANUALLY (or via Editor)
// --------------------------------------------------------
const createMemeManually = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user) throw new ApiError(401, "User required")

    // Grab file from Multer
    const localFilePath = req.file?.path;
    if (!localFilePath) throw new ApiError(400, "Meme image file is required");

    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    if (!cloudinaryResponse) throw new ApiError(500, "Failed to upload to Cloudinary");
    const finalImageUrl = cloudinaryResponse.secure_url;

    const { templateId, title, type } = req.body;
    const parsedTextLayers = safeParseJSON(req.body.textLayers);
    const parsedTags = safeParseJSON(req.body.tags);
    let templateObjectId = null;
    if (templateId && templateId !== "null") {
        let template;
        if (type === "user") {
            template = await UserTemplate.findOne({ templateId: templateId });
        } else {
            template = await Template.findOne({ templateId: templateId });
        }
        if(!template) throw new ApiError(404, "Template not found")
        templateObjectId = template._id;
    }
    if (parsedTextLayers.length === 0) throw new ApiError(400, "Text Layers required");

    const safeTextLayers = parsedTextLayers.map(layer => ({
        ...layer,
        x: clamp(Number(layer.x) ?? 50, 0, 100),
        y: clamp(Number(layer.y) ?? 10, 0, 100),
        size: clamp(Number(layer.size) ?? 24, 10, 100),
        layerWidth: clamp(Number(layer.layerWidth) ?? 90, 10, 100),
    }));

    const safeTags = parsedTags.map(t => String(t).toLowerCase());

    const meme = await CreatedMeme.create({
        creator: user._id,
        template: templateObjectId !== "null" ? templateObjectId : null,
        finalImageUrl: finalImageUrl, // Use the uploaded URL
        isAIGenerated: false,
        textLayers: safeTextLayers,
        tags: safeTags,
        title: title || "Untitled Meme",
        originalScenario: ""
    })

    return res.status(200).json(new ApiResponse(200, meme, "Meme created successfully"))
})

// --------------------------------------------------------
// 4. GET ALL CREATED MEMES
// --------------------------------------------------------
const getAllCreatedMemes = asyncHandler(async(req, res) => {
    const { username } = req.params;
    if(!username?.trim()){
        throw new ApiError(400, "Username is required")
    }
    const user = await User.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, "i") } 
    });
    if(!user) throw new ApiError(404, "User not found")
    
    const memes = await CreatedMeme.find({creator: user._id})
        .populate("creator", "username profilePic")
        .populate("template", "name imageUrl")
        .sort({ createdAt: -1 })
        
    return res.status(200).json(
        new ApiResponse(200, {memes}, "All created memes fetched successfully")
    )
})

// --------------------------------------------------------
// 5. EDIT CREATED MEME
// --------------------------------------------------------
const editCreatedMeme = asyncHandler(async (req, res) => {
    const user = req.user;
    const { memeId } = req.params;
    const parsedTags = safeParseJSON(req.body.tags, null);
    const { title } = req.body;
    const meme = await CreatedMeme.findById(memeId);
    if (!meme) throw new ApiError(404, "Meme not found");

    if (meme.creator.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to edit this meme");
    }

    // Usually, users just edit tags/titles after posting. 
    // If they want to edit the image, they'd make a new post.
    if (parsedTags) {
        meme.tags = parsedTags.map(t => String(t).toLowerCase());
    }
    if(title){
        meme.title = title;
    }

    await meme.save();

    return res.status(200).json(new ApiResponse(200, meme, "Meme updated successfully"));
});

// --------------------------------------------------------
// 6. DELETE CREATED MEME
// --------------------------------------------------------
const deleteCreatedMeme = asyncHandler(async (req, res) => {
    const user = req.user;
    const { memeId } = req.params;

    const meme = await CreatedMeme.findById(memeId);
    if (!meme) throw new ApiError(404, "Meme not found");

    if (meme.creator.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this meme");
    }
    if(meme.imageUrl){
        await deleteFromCloudinary(meme.imageUrl)
    } else if(meme.finalImageUrl){
        await deleteFromCloudinary(meme.finalImageUrl);
    }
    // Optional: Extract Cloudinary public ID to delete the image from cloud storage
    // const publicId = meme.finalImageUrl.split('/').pop().split('.')[0];
    // await deleteFromCloudinary(publicId);

    await CreatedMeme.findByIdAndDelete(memeId);

    return res.status(200).json(new ApiResponse(200, {}, "Meme deleted successfully"));
});

export {
    previewMeme,
    createMemeWithAI,
    createMemeManually,
    getAllCreatedMemes,
    editCreatedMeme,
    deleteCreatedMeme
}