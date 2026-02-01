import { UserTemplate } from "../models/user.template.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/fileUpload.js";
import { Template } from "../models/template.model.js";
import { SavedTemplate } from "../models/savedTemplate.model.js";

const uploadTemplate = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(404, "Error getting user");
    }
    const imageUrlLocalPath = req.file?.path;
    const { name } = req.body;
    if(!imageUrlLocalPath){
        throw new ApiError(400, "Bad request")
    }
    const imageUrl = await uploadOnCloudinary(imageUrlLocalPath);
    if(imageUrl.url === ""){
        throw new ApiError(500, "Error uploading files")
    }
    const template = await UserTemplate.create({
        submittedBy: user,
        imageUrl: imageUrl.url,
        name: user.username || name,
        status: "approved"
    })
    if(!template){
        throw new ApiError(500, "Error uploading template")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { template: template.toObject() }, "User template uploaded successfully!")
    )
})

const getSingleUserTemplate = asyncHandler(async(req, res) => {
    const { templateId } = req.params;
    if(!templateId){
        throw new ApiError(400, "Template id required")
    }
    const template = await UserTemplate.findOne({
        templateId,
        submittedBy: req.user._id
    })
    if(!template){
        throw new ApiError(404, "Template not found!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { template: template.toObject() }, "User Template fetched successfully")
    )
})

const getAllUserTemplates = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(404, "User not found!")
    }
    const templates = await UserTemplate.find({
        submittedBy: user._id
    })
    if(!templates){
        throw new ApiError(500, "Error getting user templates")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { templates: templates }, "All user templates fetched successfully")
    )
})

const getSingleTemplate = asyncHandler(async(req, res) => {
    const { templateId } = req.params;
    if(!templateId){
        throw new ApiError(400, "give template id gng")
    }
    const template = await Template.findOne({
        templateId
    })
    if(!template){
        throw new ApiError(500, "Error getting template")
    }
    let isSaved = false;
    const savedTemplate = await SavedTemplate.exists({
        template: template._id,
        user: req.user?._id
    })
    if(savedTemplate){
        isSaved = true
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { template: template.toObject(), isSaved }, "Template fetched successfully!")
    )
})


const getTemplatesByCategory = asyncHandler(async(req, res) => {
    const { category, subCategory, page = 1, limit = 40 } = req.query;
    
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {};
    if(category) query.category = category;
    if(subCategory) query.subCategory = subCategory;

    if(Object.keys(query).length === 0){
        query.category = "Other"
    }
    const totalTemplates = await Template.countDocuments(query);
    const totalPages = Math.ceil(totalTemplates / parsedLimit);

    const templates = await Template.find(query)
        .skip(skip)
        .limit(parsedLimit)
        .select('-__v, -updatedAt')
    if(templates.length === 0 && totalTemplates > 0){
        return res.status(404).json(
            new ApiResponse(404, null, `No templates found on ${parsedPage}`)
        )
    }
    if(templates.length === 0 && totalTemplates === 0){
        return res
        .status(404)
        .json(404, [], "No templates found!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            templates,
            pagination: {
                totalTemplates,
                totalPages,
                currentPage: parsedPage,
                limit: parsedLimit
            }
        }, "Templates fetched successfully")
    )
})

const getRandomTemplates = asyncHandler(async(req, res) => {
    const { count = 30 } = req.query;
    const parsedCount = parseInt(count);

    const randomTemplates = await Template.aggregate([
        { $sample: { size: parsedCount} },
        { $project: { __v: 0, updatedAt: 0}}
    ])
    if(randomTemplates.length === 0){
        return res
        .status(404)
        .json(
            new ApiResponse(404, [], "No templates found")
        )
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, { templates: randomTemplates }, "Random templates fetched successfully!")
    )
})

const searchTemplates = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 40 } = req.query;

    if (!q) {
        throw new ApiError(400, "Search query 'q' is required");
    }

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {
        $text: { $search: q }
    };

    const totalTemplates = await Template.countDocuments(query);
    const totalPages = Math.ceil(totalTemplates / parsedLimit);

    const templates = await Template.find(query)
        .skip(skip)
        .limit(parsedLimit)
        .select('-__v -updatedAt')
        .exec();

    if (templates.length === 0) {
        return res.status(404).json(new ApiResponse(404, [], "No templates found for your search."));
    }

    return res.status(200).json(new ApiResponse(200, {
        templates,
        pagination: {
            totalTemplates,
            totalPages,
            currentPage: parsedPage,
            limit: parsedLimit
        }
    }, "Templates searched successfully"));
});

export {
    uploadTemplate,
    getSingleUserTemplate,
    getAllUserTemplates,
    getSingleTemplate,
    getTemplatesByCategory,
    getRandomTemplates,
    searchTemplates
}
