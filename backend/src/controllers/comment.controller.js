import { Comment } from "../models/comment.model.js";
import { CreatedMeme } from "../models/createdMeme.model.js";
import { MemeFeedPost } from "../models/memeFeedPost.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
        clonedAuthor: temporaryMeme.author,
        clonedTitle: temporaryMeme.title,
        finalImageUrl: temporaryMeme.contentUrl,
        isAIGenerated: false,
        template: null,
    })
    return {
        finalContentId: permanentMeme._id,
        finalContentType: "CreatedMeme"
    }
}

const addComment = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user || !user.is_registered){
        throw new ApiError(401, "Login required!")
    }
    const {content} = req.body;
    if(!content || content === ""){
        throw new ApiError(400, "Content can't be empty!")
    }
    const {contentId, contentType, parentCommentId} = req.params;
    if(!contentId || !contentType){
        throw new ApiError(400, "ContentId or contentType missing!")
    }
    let finalContentId = contentId;
    let finalContentType = contentType;
    let targetComment = null;
    if(parentCommentId){
        targetComment = await Comment.findById(parentCommentId);
        if(!targetComment){
            throw new ApiError(404, "Parent comment not found!")
        }
        finalContentId = targetComment.contentId;
        finalContentType = targetComment.contentType;
    }
    else if(contentType === "MemeFeedPost"){
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
        contentType: finalContentType,
        parentComment: parentCommentId
    }
    const comment = await Comment.create(commentFilter)
    if(!comment){
        throw new ApiError(500, "Comment failed to reach database. Kill troyy")
    }
    const {newCommentCount, fullComment} = await Promise.all([
        Comment.countDocuments({
            contentId: finalContentId,
            contentType: finalContentType
        }),
        Comment.findById(comment._id).populate({path: "user", populate: "username profilePic"})
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200, {fullComment, newCommentCount, contentId: finalContentId, contentType: finalContentType})
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

    const {content, comments, commentsCount} = await Promise.all([
        CreatedMeme.findById(finalContentId).select("finalImageUrl clonedTitle clonedAuthor"),

        Comment.find({contentId: finalContentId, contentType: finalContentType, parentComment: null})
            .populate({path: "user", select: "profilePic username"}),
        
        Comment.countDocuments({contentId: finalContentId, contentType: finalContentType})
    ])
    if(!content){
        throw new ApiError(404, "Content of comments not found")
    }
    const commentDetails = {
        memeContext: content.toObject(),
        comments: comments,
        commentsCount: commentsCount
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, commentDetails, "Comments fetched successfully")
    )
})

const updateComment = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Login required")
    }
    const { commentId } = req.params;
    const { newCommentContent } = req.body;
    if(!commentId){
        throw new ApiError(400, "Comment Id required!")
    }
    const comment = await Comment.findOneAndUpdate({
        _id: commentId,
        user: user._id
    }, {
        $set: {content: newCommentContent}
    }, {new: true});
    if(!comment){
        throw new ApiError(404, "Comment not found or Unauthorised access")
    }
    /*
    if(!comment){
        throw new ApiError(404, "Comment not found!")
    }
    if(!comment.user.equals(user._id)){
        throw new ApiError(401, "Unauthorised access!. It ain't that easy gng")
    }
    if(newCommentContent === comment.content){
        throw new ApiError(400, "At least change something")
    }
    comment.content = newCommentContent;
    await comment.save({validateBeforeSave: false});
    */
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
    deleteComment
}