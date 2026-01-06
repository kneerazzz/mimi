import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateMemeContext } from "../utils/geminiResponse.js";
import { Template } from "../models/template.model.js";
import { CreatedMeme } from "../models/createdMeme.model.js";
import { ApiResponse } from "../utils/apiResponse.js";


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

    console.log("tags : ", emotionTags)
    console.log(caption)
    const templates = await Template.find({
        emotionTags: {$in: emotionTags}
    }).limit(20)

    if(!templates || templates.length === 0){
        throw new ApiError(404, "No templates found for this context!")
    }

    const allowedPositions = ["Top", "Left", "Right", "Bottom", "Custom"];


    const previews = templates.map(template => {
        const hasRegions =
            Array.isArray(template.textRegions) &&
            template.textRegions.length > 0;
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
            : [
                {
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
                }
            ];

    return {
        templateId: template._id,
        templateUrl: template.imageUrl,
        textLayers,
        constraints: {
            x: [0, 100],
            y: [0, 100],
            size: [10, 100],
            layerWidth: [10, 100]
        }
    };
    });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                caption,
                emotionTags,
                previews
            },
            "Preview is ready"
        )
    )
})


const createMemeWithAI = asyncHandler(async(req, res) => {
    const user = req.user;
    if(user.is_registered === false){
        throw new ApiError(401, "Login required")
    }
    const {templateId, textLayers, originalScenario, finalImageUrl, tags} = req.body; //user provides which template to use out of 20 we gave him


    if(!finalImageUrl){
        throw new ApiError(400, "Meme image url required")
    }
    if (!Array.isArray(textLayers) || textLayers.length === 0) {
        throw new ApiError(400, "textLayers required");
    }
    const safeTags = Array.isArray(tags) ? tags.map(t => String(t).toLowerCase()) : [];
    const template = await Template.findById(templateId)
    if(!template){
        throw new ApiError(404, "Template Not found")
    }

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    const safeTextLayers = textLayers.map(layer => ({
        ...layer,
        x: clamp(layer.x ?? 50, 0, 100),
        y: clamp(layer.y ?? 10, 0, 100),
        size: clamp(layer.size ?? 24, 10, 100),
        layerWidth: clamp(layer.layerWidth ?? 90, 10, 100),
    }));

    const meme = await CreatedMeme.create({
        creator: user._id,
        template: templateId,
        finalImageUrl: finalImageUrl,
        isAIGenerated: true,
        originalScenario: originalScenario || "",
        textLayers: safeTextLayers,
        tags: safeTags
    })

    if(!meme){
        throw new ApiError(500, "Error creating meme")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, meme, "Meme created successfully")
    )
})

const createMemeManually = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "User required")
    }
    const {finalImageUrl, templateId, textLayers, tags} = req.body;
    const template = await Template.findById(templateId);
    if(!template){
        throw new ApiError(404, "Template not found")
    }
    if(!finalImageUrl) {
        throw new ApiError(400, "finalImageUrl required")
    }
    if(!Array.isArray(textLayers) || textLayers.length === 0){
        throw new ApiError(400, "Text Layers required")
    }
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    const safeTextLayers = textLayers.map(layer => ({
        ...layer,
        x: clamp(layer.x ?? 50, 0, 100),
        y: clamp(layer.y ?? 10, 0, 100),
        size: clamp(layer.size ?? 24, 10, 100),
        layerWidth: clamp(layer.layerWidth ?? 90, 10, 100),
    }));

    const safeTags = Array.isArray(tags) ? tags.map(t => String(t).toLowerCase()) : [];
    const meme = await CreatedMeme.create({
        creator: user._id,
        template: templateId,
        finalImageUrl: finalImageUrl,
        isAIGenerated: false,
        textLayers: safeTextLayers,
        tags: safeTags || [],
        originalScenario: ""
    })
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, meme, "Meme created successfully"
        )
    )
})

export {
    previewMeme,
    createMemeWithAI,
    createMemeManually
}