import { CreatedMeme } from "../models/createdMeme.model";
import { Like } from "../models/like.model";
import { MemeFeedPost } from "../models/memeFeedPost.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";


const toggleLike = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Login required!")
    }
    const {contentId, contentType} = req.params;
    if(!contentId || !contentType){
        throw new ApiError(400, "Content Id and Type are required!")
    }

    const likesFilter = {
        user: user._id,
        contentId: contentId,
        contentType: contentType
    }
    const existingLike = await Like.findOne(likesFilter)
    let message , isLiked;

    if(existingLike){
        await Like.deleteOne(likesFilter);
        message = "Meme like removed successfully";
        isLiked = false;
    } else {
        await Like.create(likesFilter);
        message = "Meme liked successfully";
        isLiked = true
    }
    const newLikeCount = await Like.countDocuments({
        contentId: contentId,
        contentType: contentType
    })
    if(contentType === "MemeFeedPost"){
        const memeDetails = await MemeFeedPost.findById(contentId);
        if(!memeDetails){
            throw new ApiError(500, "put all the blame on neeraj")
        }
        const addedMeme = await CreatedMeme.create({
            creator: memeDetails.author,
            finalImageUrl: memeDetails.contentUrl,
            isAIGenerated: false,
        })
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {isLiked, newLikeCount, contentId, contentType}, message)
    )
})

const getAllLikedMemes = asyncHandler(async(req, res) => {
    const user = req.user;
    const { contentType } = req.params;
    if(!user){
        throw new ApiError(401, "wohaa calm down. Login required")
    }
    let content
})