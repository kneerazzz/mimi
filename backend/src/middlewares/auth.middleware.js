import { ACCESS_TOKEN_SECRET } from "../config/env.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'


export const verifyJwt = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer ", "").trim();

        if(!token){
            throw new ApiError(401, "Unauthorised access")
        }
        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?.id);
        if(!user){
            console.warn(`JWT found for non-existent user ID: ${user._id}`);
            return next()
        }
        req.user = user;
        user.is_registered = true;

        next();
    } catch (error) {
        console.warn(`JWT verification failed: ${error.message}`);
        next();
    }
})