import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    contentType: {
        type: String,
        enum: ["MemeFeedPost", "CreatedMeme"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
})

commentSchema.index({user: 1, contentType: 1, contentId: 1}, {unique: true})

export const Comment = mongoose.model("Comment", commentSchema)