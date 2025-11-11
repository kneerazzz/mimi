import mongoose from "mongoose";

const savedMemeSchema = new mongoose.Schema({
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    contentType: {
        type: String,
        enum: ["MemeFeedPost", "CreatedMeme"],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

savedMemeSchema.index({user: 1, contentId: 1}, {unique: true})

export const SavedMeme = mongoose.model("SavedMeme", savedMemeSchema)