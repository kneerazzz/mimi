import { CreatedMeme } from "../models/createdMeme.model.js";
import { Like } from "../models/like.model.js";
import { MemeFeedPost } from "../models/memeFeedPost.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getOrCreatePermanentMeme = async(contentId) => {
    const temporaryMeme = await MemeFeedPost.findById(contentId);
    if(!temporaryMeme){
        throw new ApiError(404, "Original Meme content not found")
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
        creator: "692fe332caca25fcecc0f909"
    })
    return {
        finalContentId: permanentMeme._id,
        finalContentType: "CreatedMeme"
    }
}

const toggleLike = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user.is_registered){
        throw new ApiError(401, "Login required")
    }
    const {contentId, contentType} = req.params;
    if(!contentId || !contentType){
        throw new ApiError(400, "contentId and contentType required")
    }
    let finalContentId = contentId;
    let finalContentType = contentType;

    if(contentType === "MemeFeedPost"){
        const result = await getOrCreatePermanentMeme(contentId);
        finalContentId = result.finalContentId;
        finalContentType = result.finalContentType; 
    } else if(!["Comment", "CreatedMeme"].includes(contentType)){
        throw new ApiError(400, "Invalid content type for liking!")
    }
    const likesFilter = {
        user: user._id,
        contentId: finalContentId,
        contentType: finalContentType
    }
    let message, isLiked;
    const existingLike = await Like.findOne(likesFilter)
    if(existingLike){
        await Like.deleteOne(likesFilter);
        message = `Like removed successfully`;
        isLiked = false
    }
    else {
        await Like.create(likesFilter)
        message = 'Liked successfully';
        isLiked = true;
    }
    const newLikesCount = await Like.countDocuments({
        contentId: finalContentId,
        contentType: finalContentType
    })
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, {isLiked, newLikesCount, contentId: finalContentId, contentType: finalContentType}, message
        )
    )
})

const getAllLikedMemes = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user.is_registered){
        throw new ApiError(401, "Login required!")
    }
    const memes = await Like.find({
        user: user._id,
        contentType: "CreatedMeme"
    }).select("contentId")
    if(memes.length === 0){
        return res
        .status(200)
        .json(
            new ApiResponse(200, [], "No liked memes found!")
        )
    }
    const permanentMemeIds = memes.map(meme => meme.contentId);
    const likedMemes = await CreatedMeme.find({_id: { $in: permanentMemeIds}})
        .populate({ path: "creator", select: "username profilePic"})
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, likedMemes, "Successfully fetched the liked memes"
        )
    )
})

export {
    toggleLike,
    getAllLikedMemes
}