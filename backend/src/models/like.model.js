import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        requied: true
    },
    contentType: {
        type: String,
        required: true,
        enum: ["MemeFeedPost", "CreatedMeme", "Comment"]
    }
}, {timestamps: true})

likeSchema.index({ user: 1, contentId: 1, contentType: 1 }, {unique: true})

export const Like = mongoose.model("Like", likeSchema)