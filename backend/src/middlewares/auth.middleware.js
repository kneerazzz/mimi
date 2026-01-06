// middlewares/verifyJwt.js
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/env.js";
import { User } from "../models/user.model.js";

export const verifyJwt = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || (req.headers("Authorization")?.replace("Bearer ", ""))
        if (!token) {
            console.log("token not found")
            return next(); // anonymous user stays
        }

        let decoded;
        try {
            decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        } catch (err) {
            console.warn("Invalid JWT:", err.message);
            return next(); // fallback to anonymous user
        }

        const user = await User.findById(decoded._id);
        if (!user) {
            console.warn("JWT refers to non-existent user:", decoded._id);
            return next(); // fallback to anonymous user
        }

        console.log("verifyjwt success", user.username)
        // Override req.user with the real user
        req.user = user;
        req.user.is_registered = true;

        next();

    } catch (error) {
        console.warn("JWT verification error:", error.message);
        next(); // always fall back to anon user
    }
};
