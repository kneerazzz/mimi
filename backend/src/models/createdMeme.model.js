import mongoose from 'mongoose'


const createdMemeSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: "troyy_hu"
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
        ref: "MemeFeedPost",
        index: true,
        sparse: true,
        unique: true,
        default: null
    },
    clonedContentUrl: {
        type: String,
    },
    clonedTitle: {
        type: String
    },
    clonedAuther: {
        type: String
    },
    originalRedditId: {
        type: String
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
            lineHeight: { type: Number, default: 1.2 },
            
            // Custom positioning (Advanced Editor) - Normalized coordinates
            x: { type: Number, default: 50 }, // 0 to 100
            y: { type: Number, default: 10 }, // 0 to 100
            layerWidth: { type: Number, default: 90 }, // 0 to 100
        }
    ],
    originalScenario: {
        type: String
    }
}, {timestamps: true})


export const CreatedMeme = mongoose.model("CreatedMeme", createdMemeSchema)