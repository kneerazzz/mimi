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

    const selectedTemplates = templates[Math.floor(Math.random() * templates.length)]

    const initialTextLayers = selectedTemplates.textRegions.map(region => ({
        text: caption,
        position: region.postion,
        size: region.size || 24,
        fontColor: region.fontColor || "#FFFFFF",
        strokeColor: region.strokeColour || "#000000",
        fontFamily: region.fontFamily || "Impact",
        textAlign: region.textAlign || "center",
        isBold: true,
        isItalic: false,
        lineHeight: 1.2,
        x: region.x || 50,
        y: region.y || 10,
        layerWidth: region.width || 90
    }))

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {meme: {
                templateId: selectedTemplates._id,
                templateUrl: selectedTemplates.imageUrl,
                textLayers: initialTextLayers
            }},
            "Preview is ready"
        )
    )
})


const createMemeWithAI = asyncHandler(async(req, res) => {
    const user = req.user;
    if(user.is_registered === false){
        throw new ApiError(401, "Login required")
    }
    const {templateId, textLayers, originalScenario, finalImageUrl} = req.body; //user provides which template to use out of 20 we gave him


    if(!finalImageUrl){
        throw new ApiError(400, "Meme image url required")
    }
    if (!Array.isArray(textLayers) || textLayers.length === 0) {
        throw new ApiError(400, "textLayers required");
    }

    const template = await Template.findById(templateId)
    if(!template){
        throw new ApiError(404, "Template Not found")
    }
    const meme = await CreatedMeme.create({
        creator: user._id,
        template: templateId,
        finalImageUrl: finalImageUrl,
        isAIGenerated: true,
        originalScenario: originalScenario || "",
        textLayers: textLayers
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
    const {finalImageUrl, templateId, textLayers} = req.body;
    const meme = await CreatedMeme.create({
        creator: user._id,
        template: templateId,
        finalImageUrl: finalImageUrl,
        isAIGenerated: false,
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