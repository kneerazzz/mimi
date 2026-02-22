import { Comment } from "../models/comment.model.js";
import { CreatedMeme } from "../models/createdMeme.model.js";
import { MemeFeedPost } from "../models/memeFeedPost.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getOrCreatePermanentMeme = async(contentId) => {
    const temporaryMeme = await MemeFeedPost.findById(contentId);
    if(!temporaryMeme){
        throw new ApiError(404, "Meme not avaliable for comment!")
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
        creator: "69689043899b4365dc6015d9" // Make sure this is intended
    })
    return {
        finalContentId: permanentMeme._id,
        finalContentType: "CreatedMeme"
    }
}

const addComment = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user.is_registered){
        throw new ApiError(401, "Login required!")
    }
    const {content, parentCommentId} = req.body;
    if(!content || content === ""){
        throw new ApiError(400, "Content can't be empty!")
    }
    const {contentId, contentType} = req.params;
    if(!contentId || !contentType){
        throw new ApiError(400, "ContentId or contentType missing!")
    }
    
    let finalContentId = contentId;
    let finalContentType = contentType;
    
    // 1. If replying to a comment, resolve the parent
    if(parentCommentId){
        // We need to find the parent to get the correct ROOT Content ID
        const targetComment = await Comment.findById(parentCommentId);
        
        if(!targetComment){
            throw new ApiError(404, "Parent comment not found!")
        }
        
        // Use the parent's contentId so all nested replies belong to the same Meme
        finalContentId = targetComment.contentId;
        finalContentType = targetComment.contentType;
    }
    // 2. If it's a top-level comment on a temporary meme, make it permanent
    else if(contentType === "MemeFeedPost"){
        const result = await getOrCreatePermanentMeme(contentId);
        finalContentId = result.finalContentId;
        finalContentType = "CreatedMeme";
    }
    else if(!["CreatedMeme"].includes(contentType)){
        throw new ApiError(400, "Invalid content type for comment")
    }

    const commentFilter = {
        user: user._id,
        content: content,
        contentId: finalContentId,
        contentType: finalContentType,
        parentComment: parentCommentId || null
    }

    const comment = await Comment.create(commentFilter)

    if(!comment){
        throw new ApiError(500, "Comment failed to reach database.")
    }

    // Populate user details immediately for the frontend
    const fullComment = await Comment.findById(comment._id)
        .populate({path: "user", select: "username profilePic"})
        .lean();

    // OPTIONAL: Return count if you need it, but frontend needs 'fullComment' mostly
    // We return fullComment merged at the top level or inside 'data' clearly
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            // Return the comment object directly as the data (or specific key)
            // If your frontend does `response.data`, it gets this object.
            { 
                ...fullComment, // Spread it so _id is at top level of data
                likesCount: 0,
                isLiked: false 
            }, 
            "Comment added successfully"
        )
    )
})

const getAllComments = asyncHandler(async(req, res)=> {
    const user = req.user;
    if(!user.is_registered){
        throw new ApiError(401, "Login required!")
    }
    
    const { contentId, contentType } = req.params;
    if(!contentId || !contentType){
        throw new ApiError(400, "Content ID and Type are required!")
    }

    let finalContentId = contentId;
    let memeContextData = null;

    if(contentType === "MemeFeedPost"){
        const feedPost = await MemeFeedPost.findById(contentId);
        if(!feedPost) {
            throw new ApiError(404, "Meme Feed Post not found");
        }

        const existingPermanentMeme = await CreatedMeme.findOne({
            originalRedditId: feedPost.redditPostId
        });

        if(existingPermanentMeme) {
            finalContentId = existingPermanentMeme._id;
            memeContextData = existingPermanentMeme; 
        } else {
            // Return empty if no permanent record exists yet (no comments)
            return res.status(200).json(
                new ApiResponse(200, {
                    memeContext: feedPost,
                    comments: [],
                    commentsCount: 0
                }, "No comments yet")
            );
        }
    } else if (contentType === "CreatedMeme") {
        memeContextData = await CreatedMeme.findById(finalContentId);
    } else {
        throw new ApiError(400, "Unknown contentType. Bad request");
    }

    const [comments, commentsCount] = await Promise.all([
        Comment.find({
            contentId: finalContentId, 
            contentType: "CreatedMeme", 
            parentComment: null
        })
        .populate({path: "user", select: "profilePic username"})
        .sort({ createdAt: -1 }) // Newest first usually
        .lean(),
        
        Comment.countDocuments({
            contentId: finalContentId, 
            contentType: "CreatedMeme", 
            parentComment: null
        })
    ]);

    if(!memeContextData) {
         memeContextData = await CreatedMeme.findById(finalContentId).select("finalImageUrl clonedTitle clonedAuthor");
    }

    // Add likesCount default for safety if not in DB yet
    const sanitizedComments = comments.map(c => ({
        ...c,
        likesCount: c.likesCount || 0,
        isLiked: false // Default, gets updated by getMemeDetails controller usually
    }));

    const commentDetails = {
        memeContext: memeContextData,
        comments: sanitizedComments,
        commentsCount: commentsCount
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, commentDetails, "Comments fetched successfully")
    );
});

const getCommentReplies = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user.is_registered){
        throw new ApiError(401, "Login required!")
    }
    const { parentCommentId } = req.params;
    if(!parentCommentId){
        throw new ApiError(400, "Bad request. ParentCommentId required!")
    }
    const [replies, repliesCount] = await Promise.all([
        Comment.find({parentComment: parentCommentId})
        .populate({path: 'user', select: "profilePic username"})
        .sort({createdAt: 1})
        .lean(),

        Comment.countDocuments({parentComment: parentCommentId})
    ])
    
    // Sanitize
    const sanitizedReplies = replies.map(r => ({
        ...r,
        likesCount: r.likesCount || 0,
        isLiked: false
    }));
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, { replies: sanitizedReplies, repliesCount }, "Comment replies fetched successfully!")
    )
})

const updateComment = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user?.is_registered){
        throw new ApiError(401, "Login required")
    }
    const { commentId } = req.params;
    const { newCommentContent } = req.body;
    if(!commentId){
        throw new ApiError(400, "Comment Id required!")
    }
    
    // Ensure user owns the comment
    const comment = await Comment.findOneAndUpdate({
        _id: commentId,
        user: user._id
    }, {
        $set: {content: newCommentContent}
    }, {new: true});

    if(!comment){
        throw new ApiError(404, "Comment not found or Unauthorised access")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {comment}, "Comment updated successfully!")
    )
})

const deleteComment = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Login required!")
    }
    const { commentId } = req.params;
    if(!commentId){
        throw new ApiError(400, "CommentId requried!")
    }
    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        user: user._id
    });
    if(!comment){
        throw new ApiError(404, "Comment not found or Unauthorised access")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted successfully!")
    )
})


export {
    addComment,
    getAllComments,
    updateComment,
    deleteComment,
    getCommentReplies
}