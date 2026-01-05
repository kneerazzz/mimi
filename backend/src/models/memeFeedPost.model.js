import mongoose from "mongoose";

const memeFeedPostSchema = new mongoose.Schema({
    redditPostId: {
        type: String,
        unique: true,
        sparse: true,
        required: true
    },
    contentUrl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        trim: true
    },
    originalScore: {
        type: Number,
        default: 0
    },
    subreddit: {
        type: String,
        trim: true
    },
    author: {
        type: String,
    },
    lastCachedAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true})




export const MemeFeedPost = mongoose.model("MemeFeedPost", memeFeedPostSchema)