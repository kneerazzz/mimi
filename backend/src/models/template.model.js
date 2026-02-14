import mongoose from "mongoose";


const templateSchema = new mongoose.Schema({
    templateId: {
        type: String,
        unique: true,
        index: true,
        trim: true,
        sparse: true,
        requied: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        default: "Other",
    },
    subCategory: {
        type: String,
        default: "General",
    },
    emotionTags: {
        type: [String],
        index: true,
        default: []
    },
    textRegions: [
        {
            name: { type: String, required: true },
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            width: { type: Number, default: 100 },
            height: { type: Number, default: 100 },
        }
    ],
    requiresAdvancedEditor: {
        type: Boolean,
        default: false,
    }

}, {timestamps: true})

templateSchema.index({ name: 'text', category: 'text', subCategory: 'text', emotionTags: 'text' });


export const Template = mongoose.model("Template", templateSchema)