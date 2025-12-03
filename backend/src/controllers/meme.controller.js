import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { MemeFeedPost } from "../models/memeFeedPost.model.js";
import { fetchMemeFeedFromReddit } from "../utils/reddit.util.js";
import { CreatedMeme } from "../models/createdMeme.model.js";
import { Like } from "../models/like.model.js" 
import { SavedMeme } from "../models/savedMeme.model.js";
import { Comment } from "../models/comment.model.js"; 

/**
 * Helper function to determine if a user has interacted with a temporary post, 
 * considering its permanent clone (CreatedMeme) record.
 * @param {Array} feed - Array of MemeFeedPost documents (the temporary feed).
 * @param {ObjectId} userId - The registered user's ID.
 * @param {string} contentType - The expected content type for the feed (MemeFeedPost).
 */
const getInteractionStatus = async(feed, userId, contentType = "MemeFeedPost") => {
    if (!feed || feed.length === 0) {
        return []; 
    }
    
    const tempContentIds = feed.map(post => post._id);
    const permanentRedditIds = feed.map(post => post.redditPostId);
    
    const permanentClones = await CreatedMeme.find({ originalRedditId: { $in: permanentRedditIds } }).select('_id originalRedditId');
    
    const cloneMap = new Map();
    permanentClones.forEach(clone => {
        cloneMap.set(clone.originalRedditId, clone._id.toString());
    });

    const permanentCloneMDBIds = Array.from(cloneMap.values());
    const allInteractionIds = [...tempContentIds, ...permanentCloneMDBIds];


    // 3. Query the Like and SavedMeme collections for all interaction IDs
    const [userLikes, userSaves] = await Promise.all([
        Like.find({
            user: userId,
            contentId: { $in: allInteractionIds },
            contentType: { $in: ["MemeFeedPost", "CreatedMeme"] } 
        }).select("contentId"),
        SavedMeme.find({
            user: userId,
            contentId: { $in: allInteractionIds },
            contentType: { $in: ["MemeFeedPost", "CreatedMeme"] }
        }).select("contentId")
    ])

    const likedIds = new Set(userLikes.map(like => like.contentId.toString()));
    const savedIds = new Set(userSaves.map(save => save.contentId.toString()));

    // 4. Map the results back to the original temporary feed posts
    return feed.map(post => {
        const tempMDBId = post._id.toString();
        const permRedditId = post.redditPostId;
        const permanentCloneId = cloneMap.get(permRedditId); // Look up permanent ID using Reddit ID

        // Check interaction status against: 
        // a) The temporary MDB ID (in case the like hasn't been switched over yet)
        const checkTemporary = likedIds.has(tempMDBId); 
        
        // b) The permanent clone MDB ID (where the persistence record lives)
        const checkPermanent = permanentCloneId && likedIds.has(permanentCloneId);
        
        const isLiked = checkTemporary || checkPermanent;
        
        // Repeat logic for isSaved
        const checkTemporarySave = savedIds.has(tempMDBId);
        const checkPermanentSave = permanentCloneId && savedIds.has(permanentCloneId);
        const isSaved = checkTemporarySave || checkPermanentSave;


        const postObject = post.toObject ? post.toObject() : post;
        return {
            ...postObject,
            isLiked: isLiked,
            isSaved: isSaved
        }
    })
}

const cacheMemeFeed = async() => {
    try {
        const freshMemes = await fetchMemeFeedFromReddit(100);
        
        if(freshMemes.length === 0){
            console.warn("Meme Feed Cache: Fetched zero valid memes.");
            return; 
        }

        const bulkOperations = freshMemes.map(meme => ({
            updateOne: { 
                filter: { redditPostId: meme.redditPostId },
                update: {
                    $set: { ...meme}
                },
                upsert: true
            }
        }))
        
        const result = await MemeFeedPost.bulkWrite(bulkOperations)
        console.log(`Cache Update Success: Inserted ${result.upsertedCount}, Matched/Updated: ${result.matchedCount}`);

    } catch (error) {
        console.error("CRITICAL MongoDB Error during bulk caching:", error);
    }
}

const getHomeFeed = asyncHandler(async(req, res) => {
    const {page = 1, limit = 20} = req.query;
    const skip = (parseInt(page)-1) * parseInt(limit);
    const parsedLimit = parseInt(limit);
    
    let feed  = await MemeFeedPost.find({})
                .sort({originalScore: -1, lastCachedAt :-1})
                .skip(skip)
                .limit(parsedLimit)
    
    const currentUser = req.user;
    if(currentUser && currentUser.is_registered){
        // Pass the feed, user, and the temporary content type
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


const getMemeDetails = asyncHandler(async(req, res) => {
    const currentUser = req.user;
    const { contentId, contentType } = req.params; // Using req.params as per router definition
    
    if(!contentId || !contentType){
        throw new ApiError(400, "Content Id and Type are required!")
    }
    let contentModel, content;
    let finalContentId = contentId;
    let finalContentType = contentType;
    if(contentType === "MemeFeedPost"){
        const temporaryMeme = await MemeFeedPost.findById(contentId);
        if(!temporaryMeme){
            throw new ApiError(404, "Temporary meme content not found!")
        }
        const permanentMeme = await CreatedMeme.findOne({
            originalRedditId: temporaryMeme.redditPostId
        })
        if(permanentMeme){
            finalContentId = permanentMeme._id;
            finalContentType = "CreatedMeme"
        }
        contentModel = MemeFeedPost;
    } else if(contentType === "CreatedMeme"){
        contentModel = CreatedMeme;
    } else {
        throw new ApiError(400, "Invalid content type for details")
    }


    content = await contentModel.findById(contentId);
    if(!content){
        throw new ApiError(404, "Meme not found! Check the ID or content type.")
    }

    // 1. Fetch interaction stats and comments
    const [likeCount, comments] = await Promise.all([
        Like.countDocuments({contentId: finalContentId, contentType: finalContentType}),
        Comment.find({contentId: finalContentId, contentType: finalContentType})
                .populate({path: 'user', select: 'username profilePic is_registered'})
                .sort({ createdAt: 1 })
    ])
    let isLiked = false;
    let isSaved = false;
    if(currentUser && currentUser.is_registered){
        [isLiked, isSaved] = await Promise.all([
            Like.exists({user: currentUser._id, contentId: finalContentId, contentType: finalContentType}),
            SavedMeme.exists({user: currentUser._id, contentId: finalContentId, contentType: finalContentType})
        ])
    }

    const {page = 1, limit = 20} = req.query;
    const skip = (parseInt(page)-1) * parseInt(limit)
    const parsedLimit = parseInt(limit)

    let feed = await MemeFeedPost.find({})
                .sort({lastCachedAt: -1, originalScore: -1})
                .skip(skip)
                .limit(parsedLimit)


    if(currentUser && currentUser.is_registered){
        feed = await getInteractionStatus(feed, currentUser._id, "MemeFeedPost")
    } else {
        feed = feed.map(post => ({
            ...post.toObject(),
            isLiked: false,
            isSaved: false
        }))
    }
    
    // 4. Consolidate response data
    const details = {
        meme: content.toObject(),
        stats: {
            likeCount,
            commentCount: comments?.length,
            isLiked: !!isLiked,
            isSaved: !!isSaved
        },
        comments: comments
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, {memeDetails: details, backgroundFeed: feed}, "MemeDetails fetched successfully")
    )
})

export {
    cacheMemeFeed,
    getHomeFeed,
    getMemeDetails,
}