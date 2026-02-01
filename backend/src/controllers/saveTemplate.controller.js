import { SavedTemplate } from "../models/savedTemplate.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSave = asyncHandler(async(req, res) => {
    const { templateId } = req.params;;
    if(!templateId) {
        throw new ApiError(400, "template Id required!")
    }
    const user = req.user;
    if(!user.is_registered){
        throw new ApiError(401, "Login required!")
    }
    const saveTemplateFilter = {
        template: templateId,
        user: user._id
    }
    let existingSave = await SavedTemplate.findOne(saveTemplateFilter)
    let message, isSaved;
    if(existingSave){
        await SavedTemplate.deleteOne(saveTemplateFilter);
        message = "Template removed from saves successfully";
        isSaved = false;
    }
    else {
        await SavedTemplate.create(saveTemplateFilter);
        message = "Template added to saves successfully";
        isSaved = true;
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {isSaved, templateId : templateId,
        }, message)
    )
})

const getAllSavedTemplates = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user.is_registered){
        throw new ApiError(401, "Login required!")
    }
    const templates = await SavedTemplate.find({
        user: user._id
    }).populate("template", "templateId imageUrl name")
        .populate("user", "username name profilePic")
        
    if(templates.length === 0){
        return res
        .status(404)
        .json(
            new ApiResponse(404, [], "No saved templates found!")
        )
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { templates }, "Templates fetched successfully!")
    )
})


export {
    toggleSave,
    getAllSavedTemplates
}