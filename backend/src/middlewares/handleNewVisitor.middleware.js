import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const UUID_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365
}

const handelNewVisitor = asyncHandler(async(req, res, next) => {
    try {
            let user = null;
            const clientUuid = req.cookies?.visitor_uuid;
            let shouldSetCookie = false;
        
            if(clientUuid){
                user = await User.findOne({
                    uuid: clientUuid
                })
            }
            if(!user){
                user = await User.create({});
                shouldSetCookie = true;
            }
            else if(!clientUuid || user.uuid !== clientUuid){
                shouldSetCookie: true;
            }
            if(shouldSetCookie){
                res.cookie("visitor_uuid", user.uuid, UUID_COOKIE_OPTIONS)
            }
            req.user = user;
            next();
    } catch (error) {
        console.log("Error creating new visitor accound");
        throw new ApiError(500, "Error creating new visitor accound")
    }
})
export default handelNewVisitor;