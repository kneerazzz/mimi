import { CreatedMeme } from "../models/createdMeme.model.js";
import { Like } from "../models/like.model.js";
import { MemeFeedPost } from "../models/memeFeedPost.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SavedMeme } from "../models/savedMeme.model.js";


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
        creator: "69689043899b4365dc6015d9"
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
        finalContentType = "CreatedMeme"; 
    } else if(!["Comment", "CreatedMeme"].includes(contentType)){
        throw new ApiError(400, "Invalid content type for liking!")
    }
const likesFilter = {
        user: user._id,
        contentId: finalContentId,
        contentType: finalContentType
    };
    
    let message, isLiked;
    let incrementValue = 0; // Will be +1 or -1

    const existingLike = await Like.findOne(likesFilter);
    
    if(existingLike){
        await Like.deleteOne(likesFilter);
        message = `Like removed successfully`;
        isLiked = false;
        incrementValue = -1; // Decrease count
    } else {
        await Like.create(likesFilter);
        message = 'Liked successfully';
        isLiked = true;
        incrementValue = 1; // Increase count
    }

    // --- THE FIX: Update the count on the parent document (Comment or Meme) ---
    if(finalContentType === "Comment"){
        await Comment.findByIdAndUpdate(finalContentId, { 
            $inc: { likesCount: incrementValue } 
        });
    } else if (finalContentType === "CreatedMeme") {
         // Assuming CreatedMeme also has a likesCount field (Recommended!)
        await CreatedMeme.findByIdAndUpdate(finalContentId, { 
            $inc: { likesCount: incrementValue } 
        });
    }

    // Now you don't even need to countDocuments, you can just return the status.
    // But if you want the absolute latest count to be safe:
    const newLikesCount = await Like.countDocuments({
        contentId: finalContentId,
        contentType: finalContentType
    });

    return res.status(200).json(
        new ApiResponse(
            200, 
            { isLiked, newLikesCount, contentId: finalContentId }, 
            message
        )
    );
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
        .sort({ createdAt: -1 })

    // Get all saved memes for this user to check which are saved
    const savedMemeDocs = await SavedMeme.find({
        user: user._id,
        contentId: { $in: permanentMemeIds },
        contentType: "CreatedMeme"
    }).select("contentId")
    
    const savedMemeIds = new Set(savedMemeDocs.map(doc => doc.contentId.toString()));

    // Add isLiked and isSaved to each meme
    const memesWithStatus = likedMemes.map(meme => {
        const memeObj = meme.toObject ? meme.toObject() : meme;
        return {
            ...memeObj,
            isLiked: true, // All memes in this list are liked by definition
            isSaved: savedMemeIds.has(meme._id.toString())
        };
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, memesWithStatus, "Successfully fetched the liked memes"
            )
        )
})

export {
    toggleLike,
    getAllLikedMemes
}