import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { MemeFeedPost } from "../models/memeFeedPost.model.js";
import { fetchMemeFeedFromReddit } from "../utils/reddit.util.js";
import { CreatedMeme } from "../models/createdMeme.model.js";
import { Like } from "../models/like.model.js" 
import { SavedMeme } from "../models/savedMeme.model.js";
import { Comment } from "../models/comment.model.js"; 


const MAX_MEMES = 10000;
/**
 * Helper function to determine if a user has interacted with a temporary post, 
 * considering its permanent clone (CreatedMeme) record.
 * @param {Array} feed - Array of MemeFeedPost documents (the temporary feed).
 * @param {ObjectId} userId - The registered user's ID.
 * @param {string} contentType - The expected content type for the feed (MemeFeedPost).
 */
const getInteractionStatus = async(feed, userId, contentType = "MemeFeedPost") => {
    if (!feed || feed.length === 0) return []; 
    
    const tempContentIds = feed.map(post => post._id);
    const permanentRedditIds = feed.map(post => post.redditPostId);
    
    // Find permanent clones to check for interactions there too
    const permanentClones = await CreatedMeme.find({ originalRedditId: { $in: permanentRedditIds } }).select('_id originalRedditId');
    
    const cloneMap = new Map();
    permanentClones.forEach(clone => cloneMap.set(clone.originalRedditId, clone._id.toString()));
    const permanentCloneMDBIds = Array.from(cloneMap.values());
    
    const allInteractionIds = [...tempContentIds, ...permanentCloneMDBIds];

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

    return feed.map(post => {
        const tempMDBId = post._id.toString();
        const permRedditId = post.redditPostId;
        const permanentCloneId = cloneMap.get(permRedditId);

        const isLiked = likedIds.has(tempMDBId) || (permanentCloneId && likedIds.has(permanentCloneId));
        const isSaved = savedIds.has(tempMDBId) || (permanentCloneId && savedIds.has(permanentCloneId));

        // Handle both Mongoose Documents and Aggregation Objects
        const postObject = post.toObject ? post.toObject() : post;
        
        return { ...postObject, isLiked, isSaved }
    })
}
const cacheMemeFeed = async() => {
    try {
        const freshMemes = await fetchMemeFeedFromReddit(150);
        
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

const ensureMemeFeedNotEmpty = async() => {
    const count = await MemeFeedPost.countDocuments();

    if(count === 0){
        console.log("running cacheMemeFeed to restore memes")
        await cacheMemeFeed();
        return;
    }
    
    if(count > MAX_MEMES){
        console.log("Meme overflow: starting genocide of memes")
        await trimMemeCollection();
    }
};

const trimMemeCollection = async () => {
    const total = await MemeFeedPost.countDocuments();
    const excess = total - MAX_MEMES;

    if (excess <= 0) return;

    await MemeFeedPost.find()
        .sort({ createdAt: 1 }) // oldest first
        .limit(excess)
        .deleteMany();

    console.log(`Trimmed ${excess} old memes`);
};

const getHomeFeed = asyncHandler(async(req, res) => {
    const {page = 1, limit = 100} = req.query;
    const skip = (parseInt(page)-1) * parseInt(limit);
    const parsedLimit = parseInt(limit);
    
    let feed  = await MemeFeedPost.aggregate([
        { $sample: { size: parsedLimit }}
    ])
    
    const currentUser = req.user;
    if(currentUser && currentUser.is_registered){
        // Pass the feed, user, and the temporary content type
        feed = await getInteractionStatus(feed, currentUser._id, "MemeFeedPost")
    } else {
        feed = feed.map(post => ({
            ...post,
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

const getTrendingMemes = asyncHandler(async(req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page)-1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    let feed = await MemeFeedPost.find({})
        .sort({ originalScore: -1 }) 
        .skip(skip)
        .limit(parsedLimit);

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
    
    return res.status(200).json(
        new ApiResponse(200, { feed }, "Trending memes fetched successfully")
    )
});


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
    const [likeCount, rawComments] = await Promise.all([
        Like.countDocuments({contentId: finalContentId, contentType: "CreatedMeme"}),
        Comment.find({contentId: finalContentId, contentType: "CreatedMeme"})
                .populate({path: 'user', select: 'username profilePic is_registered'})
                .sort({ createdAt: 1 })
                .lean()
    ])
    let isLiked = false;
    let isSaved = false;
    let processedComments = rawComments;
    if(currentUser && currentUser.is_registered){
        // A. Check Meme Status
        const [memeLike, memeSave] = await Promise.all([
            Like.findOne({user: currentUser._id, contentId: finalContentId, contentType: "CreatedMeme"}),
            SavedMeme.findOne({user: currentUser._id, contentId: finalContentId, contentType: "CreatedMeme"})
        ]);
        isLiked = !!memeLike;
        isSaved = !!memeSave;

        // B. Check COMMENT Status (The Fix) 
        // Get all comment IDs
        const commentIds = rawComments.map(c => c._id);
        
        // Find which of these comments the user has liked
        const userCommentLikes = await Like.find({
            user: currentUser._id,
            contentType: "Comment",
            contentId: { $in: commentIds }
        }).select("contentId");

        // Create a Set for O(1) lookups
        const likedCommentIds = new Set(userCommentLikes.map(l => l.contentId.toString()));

        // Map over comments and add the 'isLiked' flag
        processedComments = rawComments.map(comment => ({
            ...comment,
            isLiked: likedCommentIds.has(comment._id.toString()),
            // Ensure likesCount exists (default to 0 if your schema doesn't have it)
            likesCount: comment.likesCount || 0 
        }));

    } else {
        // Guest User: No likes
        processedComments = rawComments.map(comment => ({
            ...comment,
            isLiked: false,
            likesCount: comment.likesCount || 0
        }));
    }

    let feed = await MemeFeedPost.aggregate([
         { $sample: { size: 100 } }
    ]);


    if(currentUser && currentUser.is_registered){
        feed = await getInteractionStatus(feed, currentUser._id, "MemeFeedPost")
    } else {
        feed = feed.map(post => ({
            ...post,
            isLiked: false,
            isSaved: false
        }))
    }
    
    // 4. Consolidate response data
    const details = {
        meme: content.toObject() ? content.toObject() : content,
        stats: {
            likeCount,
            commentCount: processedComments?.length,
            isLiked: !!isLiked,
            isSaved: !!isSaved
        },
        comments: processedComments
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
    ensureMemeFeedNotEmpty,
    getTrendingMemes
}