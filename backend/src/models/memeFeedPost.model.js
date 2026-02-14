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
    },
    uploadedToCloudinary: {
        type: Boolean,
        default: false
    },
}, {timestamps: true})

memeFeedPostSchema.index(
  {
    title: "text",
    subreddit: "text",
    author: "text"
  },
  {
    weights: {
      title: 5,
      subreddit: 2,
      author: 1
    }
  }
);




export const MemeFeedPost = mongoose.model("MemeFeedPost", memeFeedPostSchema)