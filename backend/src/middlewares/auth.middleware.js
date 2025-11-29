import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'


export const verifyJwt = asyncHandler(async(req, res) => {
    try {
        const token = req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer ", "").trim();

        if(!token){
            throw new ApiError(401, "Unauthorised access")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?.id);
        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
        req.user = user;

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "something went wrong")
    }
})