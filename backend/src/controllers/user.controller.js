import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError} from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { User } from '../models/user.model.js';

const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    }
    catch(error){
        console.log("Error generating tokens")
        throw new ApiError(500, "Something went wrong while generating tokens!!")
    }
}


const registerUser = asyncHandler(async(req, res) => {
    const {name, username, email, password} = req.body;

    const {user: anonuser} = req;


    if(!name || !username || !email || !password ||
        [name, username, email, password].some((index) => index?.trim() === "")
    ){
        throw new ApiError(400, "All registeration fields are required!")
    }

    const existedUser = await User.findOne({
        $or: [
            { username },
            { email }
        ],
        is_registered: true
    })
    
    if(existedUser){
        throw new ApiError(409, "User with similar username or email already exists")
    }
    anonuser.name = name;
    anonuser.email = email;
    anonuser.username = username;
    anonuser.password = password;
    anonuser.is_registered = true;

    await anonuser.save();

    const registeredUser = await User.findById(anonuser._id).select("-password -refreshToken")
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(anonuser._id);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    if(!registeredUser){
        throw new ApiError(500, "Something went wrong while creating user")
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, {
        ...options,
        maxAge: 24 * 60 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: 15 * 24 * 60 * 60 * 1000
    })
    .json(
        new ApiResponse(200, {user: registeredUser}, "User registered successfully")
    )

})



export {registerUser}