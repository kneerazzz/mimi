import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    contentType: {
        type: String,
        enum: ["MemeFeedPost", "CreatedMeme", "Comment"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    }
}, {
    timestamps: true
})

commentSchema.index({user: 1, contentType: 1, contentId: 1})

export const Comment = mongoose.model("Comment", commentSchema)