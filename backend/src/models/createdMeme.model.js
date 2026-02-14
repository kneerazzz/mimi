import mongoose from 'mongoose'


const createdMemeSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        default: "Untitled Meme"
    },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template"
    },
    finalImageUrl: {
        type: String,
        required: true
    },
    isAIGenerated: {
        type: Boolean,
        default: false
    },
    originalFeedPostId: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        sparse: true,
        ref: "MemeFeedPost"
    },
    clonedContentUrl: {
        type: String,
    },
    clonedTitle: {
        type: String
    },
    clonedAuthor: {
        type: String
    },
    originalRedditId: {
        type: String,
        unique: true,
        sparse: true
    },
    clonedOriginalScore: {
        type: Number,
        default: 0
    },
    clonedSubreddit: {
        type: String,
        default: "troyy hu"
    },
    textLayers: [
        {
            text: {
                type: String,
                required: true
            },
            position: {
                type: String,
                enum: ["Top", "Bottom", "Left", "Right", "Custom"],
                default: "Top"
            },
            size: {
                type: Number,
                default: 24
            },
            fontColor: { type: String, enum: ["#000000", "#FFFFFF"], default: '#FFFFFF' }, // White
            strokeColor: { type: String, enum: ["#000000", "#FFFFFF"], default: '#000000' }, // Black outline

            // Advanced Styling (Advanced Editor)
            fontFamily: { type: String, default: 'Impact' },
            textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
            isBold: { type: Boolean, default: true },
            isItalic: { type: Boolean, default: false },
            lineHeight: { type: Number, default: 1.2, min: 0.5, max: 3 },
            
            // Custom positioning (Advanced Editor) - Normalized coordinates
            x: { type: Number, default: 50, min: 0, max: 100 }, // 0 to 100
            y: { type: Number, default: 10, min: 0, max: 100 }, // 0 to 100
            layerWidth: { type: Number, default: 90, min: 10, max: 100 }, // 0 to 100
        }
    ],
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    originalScenario: {
        type: String
    }
}, {timestamps: true})


export const CreatedMeme = mongoose.model("CreatedMeme", createdMemeSchema)