import mongoose from "mongoose";

const savedTemplateSchema = new mongoose.Schema({
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

savedTemplateSchema.index({user: 1, template: 1}, {unique: true})

export const SavedTemplate = mongoose.model("SavedTemplate", savedTemplateSchema)