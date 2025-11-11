import mongoose from "mongoose";


const templateSchema = new mongoose.Schema({
    templateId: {
        type: String,
        unique: true,
        trim: true,
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
    tags: {
        type: [String],
        index: true,
        default: []
    },
    textRegions: [
        {
            name: { type: String, enum: ['Top', 'Bottom', 'Left', 'Right', 'Custom'], required: true },
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


export const Template = mongoose.model("Template", templateSchema)