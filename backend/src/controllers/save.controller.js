import { MemeFeedPost } from "../models/memeFeedPost.model.js"
import { ApiError } from "../utils/apiError.js";
import { CreatedMeme } from "../models/createdMeme.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SavedMeme } from "../models/savedMeme.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Like } from "../models/like.model.js";
const getOrCreatePermanentMeme = async(contentId) => {
    const temporaryMeme = await MemeFeedPost.findById(contentId);
    if(!temporaryMeme){
        throw new ApiError(404, "Original meme content not found")
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
        clonedAuthor: temporaryMeme.author,
        clonedTitle: temporaryMeme.title,
        finalImageUrl: temporaryMeme.contentUrl,
        isAIGenerated: false,
        template: null,
        creator: "69689043899b4365dc6015d9"
    })
    return {
        finalContentId: permanentMeme._id,
        finalContentType: "CreatedMeme"
    }
}


const toggleSave = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user.is_registered){
        throw new ApiError(401, "Login required to save memes")
    }
    const {contentId, contentType} = req.params;
    if(!contentId || !contentType){
        throw new ApiError(400, "content Id and Type are required!")
    }
    let finalContentId = contentId;
    let finalContentType = contentType;
    if(contentType === "MemeFeedPost"){
        const result = await getOrCreatePermanentMeme(contentId);
        finalContentId = result.finalContentId;
        finalContentType = "CreatedMeme";
    } else if(!["CreatedMeme"].includes(contentType)){
        throw new ApiError(400, "Invalid content type for saving")
    }
    const savingFilter = {
        user: user._id,
        contentId: finalContentId,
        contentType: "CreatedMeme"
    }
    let message, isSaved;
    const existingSave = await SavedMeme.findOne(savingFilter);
    if(existingSave){
        await SavedMeme.deleteOne(savingFilter);
        message = "Meme removed from Saves";
        isSaved = false
    }
    else {
        await SavedMeme.create(savingFilter);
        message = "Meme saved successfully!";
        isSaved = true
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {isSaved, contentId: finalContentId, contentType: "CreatedMeme"}, message)
    )
})

const getAllSavedMemes = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user.is_registered){
        throw new ApiError(401, "Login required gng")
    }
    const memes = await SavedMeme.find({
        user: user._id,
        contentType: "CreatedMeme"
    }).select("contentId")
    if(memes.length === 0){
        return res
        .status(200)
        .json(
            new ApiResponse(200, [], "No memes found")
        )
    }
    const permanentMemeIds = memes.map(meme => meme.contentId);
    const savedMemes = await CreatedMeme.find({_id: { $in: permanentMemeIds }})
        .populate({path: "creator", select: "username profilePic"})
        .sort({ createdAt: -1 })
    
    // Get all liked memes for this user to check which are liked
    const likedMemeDocs = await Like.find({
        user: user._id,
        contentId: { $in: permanentMemeIds },
        contentType: "CreatedMeme"
    }).select("contentId")
    
    const likedMemeIds = new Set(likedMemeDocs.map(doc => doc.contentId.toString()));

    // Add isLiked and isSaved to each meme
    const memesWithStatus = savedMemes.map(meme => {
        const memeObj = meme.toObject ? meme.toObject() : meme;
        return {
            ...memeObj,
            isLiked: likedMemeIds.has(meme._id.toString()),
            isSaved: true // All memes in this list are saved by definition
        };
    });
    
    return res
        .status(200)
        .json(
            new ApiResponse(200, memesWithStatus, "Successfully fetched the saved Memes!")
        )
})

export {
    toggleSave, 
    getAllSavedMemes
}