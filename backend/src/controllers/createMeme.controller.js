import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { generateMemeContext } from "../utils/geminiResponse";
import { Template } from "../models/template.model";
import { CreatedMeme } from "../models/createdMeme.model";
import { ApiResponse } from "../utils/apiResponse";
const previewMeme = asyncHandler(async(req, res) => {
    const { context } = req.body;
    const user = req.user;
    if(!context){
        throw new ApiError(400, "Context field can't be empty")
    }
    if(user.is_registered == false){
        throw new ApiError(401, "Login required for this feature!")
    }
    const {tags, caption} = await generateMemeContext(context);

    const templates = await Template.find({
        emotionTags: {$in: tags}
    }).limit(20)

    if(!templates || templates.length === 0){
        throw new ApiError(404, "No templates found for this context!")
    }

    const previews = templates.map(template => {
        const hasRegions =
            Array.isArray(template.textRegions) &&
            template.textRegions.length > 0;
        const textLayers = hasRegions
            ? template.textRegions.map(region => ({
                text: caption,
                position: region.position,
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
        textLayers
    };
    });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                caption,
                tags,
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
    const safeTags = Array.isArray(tags) ? tags.map(t => t.toLowerCase) : [];
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

    const safeTags = Array.isArray(tags) ? tags.map(t => t.toLowerCase()) : [];
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