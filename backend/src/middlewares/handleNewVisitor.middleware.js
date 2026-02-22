import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const UUID_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true, 
    sameSite: "none", 
    maxAge: 1000 * 60 * 60 * 24 * 365
}

const handleNewVisitor = asyncHandler(async(req, res, next) => {
    try {
        // 1. FIX: IF THIS IS NEXT.JS CALLING, SKIP EVERYTHING!
        if (req.headers['x-internal-secret'] === process.env.INTERNAL_SECRET_KEY) {
            return next();
        }

        if(req.user){
            return next();
        }
        
        let user = null;
        const clientUuid = req.cookies?.visitor_uuid;
        let shouldSetCookie = false;
    
        if(clientUuid){
            user = await User.findOne({
                uuid: clientUuid
            })
        }
        if(!user){
            // Creates new anonymous user
            user = await User.create({});
            shouldSetCookie = true;
        }
        else if(!clientUuid || user.uuid !== clientUuid){
            shouldSetCookie = true; 
        }
        if(shouldSetCookie && user){
            res.cookie("visitor_uuid", user.uuid, UUID_COOKIE_OPTIONS)
        }
        if(!user){
            console.error("Critical error: failed to find or Create a visitor user")
            throw new ApiError(500, "Error generating visitor session")
        }

        req.user = user; 
        req.user.is_registered = false
        next();
    } catch (error) {
        console.error("Error creating new visitor account:", error);
        throw new ApiError(500, "Error creating new visitor account")
    }
})

export default handleNewVisitor;