
import mongoose from "mongoose"
import { v4 as uuidv4 } from 'uuid'

const userTemplateSchema = new mongoose.Schema({
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    templateId: {
        type: String,
        required: true,
        default: uuidv4
    },
    imageUrl: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: "anon"
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, {timestamps: true})

export const UserTemplate = mongoose.model("UserTemplate", userTemplateSchema)