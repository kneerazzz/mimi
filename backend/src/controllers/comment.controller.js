import { Comment } from "../models/comment.model";
import { CreatedMeme } from "../models/createdMeme.model";
import { MemeFeedPost } from "../models/memeFeedPost.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const getOrCreatePermanentMeme = async(contentId) => {
    const temporaryMeme = await MemeFeedPost.findById(contentId);
    if(!temporaryMeme){
        throw new ApiError(404, "Meme not avaliable for save!")
    }
    let permanentMeme = await CreatedMeme.findOne({
        originalRedditId: temporaryMeme.redditPostId
    })
    if(permanentMeme){
        return {
            finalContentId: permanentMeme._id,
            finalContentType: "CreatedMeme"
        }
    }
    permanentMeme = await CreatedMeme.create({
        originalRedditId: temporaryMeme.redditPostId,
        clonedContentUrl: temporaryMeme.contentUrl,
        clonedAuther: temporaryMeme.author,
        clonedTitle: temporaryMeme.title,
        finalImageUrl: temporaryMeme.contentUrl,
        isAIGenerated: false,
        template: null,
        creator: "troyy hu"
    })
    return {
        finalContentId: permanentMeme._id,
        finalContentType: "CreatedMeme"
    }
}

const addComment = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user || user.is_registered){
        throw new ApiError(401, "Login required!")
    }
    const {content} = req.body;
    if(!content || content === ""){
        throw new ApiError(400, "Content can't be empty!")
    }
    const {contentId, contentType} = req.params;
    if(!contentId || !contentType){
        throw new ApiError(400, "ContentId or contentType missing!")
    }
    let finalContentId = contentId;
    let finalContentType = contentType;
    if(contentType === "MemeFeedPost"){
        const result = await getOrCreatePermanentMeme(contentId);
        finalContentId = result.finalContentId;
        finalContentType = result.finalContentType;
    }
    else if(!["CreatedMeme"].includes(contentType)){
        throw new ApiError(400, "Invalid content type for comment")
    }
    const commentFilter = {
        user: user._id,
        content: content,
        contentId: finalContentId,
        contentType: finalContentType
    }
    const comment = await Comment.create(commentFilter)
    if(!comment){
        throw new ApiError(500, "Comment failed to reach database. Kill troyy")
    }
    const newCommentCount = await Comment.countDocuments({
        contentId: finalContentId,
        contentType: finalContentType
    })
    return res
    .status(200)
    .json(
        new ApiResponse(200, {comment, newCommentCount, contentId: finalContentId, contentType: finalContentType})
    )
})

const getAllComments = asyncHandler(async(req, res)=> {
    const user = req.user;
    if(!user || !user.is_registered){
        throw new ApiError(401, "Login required!")
    }
    const {contentId, contentType} = req.params;
    if(!contentId || !contentType){
        throw new ApiError(400,"Content ID and Type is required!")
    }
    let finalContentId = contentId;
    let finalContentType = contentType;
    if(contentType === "MemeFeedPost"){
        const result = await getOrCreatePermanentMeme(contentId);
        finalContentId = result.finalContentId;
        finalContentType = result.finalContentType;
    } else if(!["Comment", "CreatedMeme"].includes(contentType)){
        throw new ApiError(400, "Invalid content type for comment")
    }
    const commentFilter = {
        contentId: finalContentId,
        contentType: finalContentType
    }
    const comments = await Comment.find(commentFilter).populate("contentId");
    if(!comments || comments.length === 0){
        throw new ApiError(500, "Error getting comments")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {comments}, "Comments fetched successfully")
    )
})