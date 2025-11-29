import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET } from "../config/env.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    uuid: {
        type: String,
        required: true,
        default: uuidv4
    },
    username: {
        type: String,
        trim: true,
        unique: true,
        index: true,
        lowercase: true,
        sparse: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        sparse: true
    },
    password: {
        type: String,
    },
    bio: {
        type: String,
        default: "holy moly"
    },
    profilePic: {
        type: String,
        default: "https://res.cloudinary.com/dmrf8lhcf/image/upload/v1762762960/Luffy__3_uppff0.jpg"
    },
    is_registered: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})



userSchema.pre('save', async function(next) {
    if(!this.isModified("password") || !this.password ){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}


userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)