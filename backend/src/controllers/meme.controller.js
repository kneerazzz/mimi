import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { MemeFeedPost } from "../models/memeFeedPost.model.js";
import { Like } from "../models/like.model.js"
import { SavedMeme } from "../models/savedMeme.model.js";
import { fetchMemeFeedFromReddit } from "../utils/reddit.js";

const getInteractionStatus = async(feed, userId, contentType = "MemeFeedPost") => {
    if(!feed && feed.length === 0){
        return {}
    }
    const contentIds = feed.map(post => post._id)
    const {userLIkes, userSaves} = await Promise.all([
        Like.find({
            user: userId,
            contentId: { $in: contentIds },
            contentType: "MemeFeedPost"
        }).select("contentId"),
        SavedMeme.find({
            user: userId,
            contentId: { $in: contentIds },
            contentType: "MemeFeedPost"
        }).select("contentId")
    ])
    const likedIds = new Set(userLIkes.map(like => like.contentId.toString()));
    const savedIds = new Set(userSaves.map(save => save.contentId.toString()));

    return feed.map(post => {
        const postId = post._id.toString();
        const postObject = post.toObject ? post.toObject() : post;
        return {
            ...postObject,
            isLiked: likedIds.has(postId),
            isSaved: savedIds.has(postId)
        }
    })
}

const cacheMemeFeed = async() => {
    const freshMemes = await fetchMemeFeedFromReddit(100);
    if(freshMemes.length === 0){
        throw new ApiError(500, "Something went wrong while fetching memes")
    }

    const bulkOperations = freshMemes.map(meme => ({
        updatedOn: {
            filter: { redditPostId: meme.redditPostId },
            update: {
                $set: { ...meme}
            },
            upsert: true
        }
    }))
    try {
        await MemeFeedPost.bulkWrite(bulkOperations)
    } catch (error) {
        console.log("error while bulk caching memes")
    }
}

const getHomeFeed = asyncHandler(async(req, res) => {
    const {page = 1, limit = 20} = req.query;
    const skip = (parseInt(page)-1) * parseInt(limit);
    const parsedLimit = parseInt(limit);
    
    let feed  = await MemeFeedPost({})
                .sort({originalScore: -1, lastCachedAt :-1})
                .skip(skip)
                .limit(parsedLimit)
    
    const currentUser = req.user;
    if(currentUser && currentUser.is_registered){
        feed = await getInteractionStatus(feed, currentUser._id, "MemeFeedPost")
    } else {
        feed = feed.map(post => ({
            ...post.toObject(),
            isLiked: false,
            isSaved: false
        }))
    }
    const totalMemes = await MemeFeedPost.countDocuments();
    const totalPages = Math.ceil(totalMemes/parsedLimit);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, {
                feed,
                pagination: {totalMemes, totalPages, currentPage: parseInt(page), limit: parsedLimit}
            },
            "Memes fetched successfully"
        )
    )
})

const toggleLike = asyncHandler(async(req, res) => {
    if(!req.user && !req.user.is_registered){
        throw new ApiError(401, "Login required to like reels")
    }
    const {contentId , contentType} = req.body;
    if(!contentId || !contentType){
        throw new ApiError(400, "Content id and contentType is required")
    }
    const likesFilter = {
        user: req.user._id,
        contentId: contentId,
        contentType: contentType
    }
    const existingLike = await Like.findOne(likesFilter)
    let message, isLiked;

    if(existingLike){
        await Like.deleteOne(likesFilter);
        message = "Meme unliked successfully";
        isLiked = false
    } else {
        await Like.create(likesFilter);
        message = "Meme liked successfully";
        isLiked = true
    }
    const newLikeCount = await Like.countDocuments({
        contentId: contentId,
        contentType: contentType
    });
    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            isLiked, newLikeCount, contentId, contentType
        }, message)
    )
})

export {
    toggleLike,
    cacheMemeFeed,
    getHomeFeed
}