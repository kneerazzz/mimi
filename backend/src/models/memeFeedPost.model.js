import mongoose from "mongoose";

const TTL_SECONDS = 86400;

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



memeFeedPostSchema.index({
    lastCachedAt: 1
}, {expireAfterSeconds: TTL_SECONDS})


export const MemeFeedPost = mongoose.model("MemeFeedPost", memeFeedPostSchema)