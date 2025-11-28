import { asyncHandler } from '../utils/asyncHandler.js'
import {apiError} from '../utils/apiError.js'
import { apiResponse } from '../utils/apiResponse.js'
import { ModifiedPathsSnapshot } from 'mongoose';
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
}


const registerUser = asyncHandler(async(req, res) => {
    const {name, username, email, password} = req.body;

    const {user: anonuser} = req;


    if(!name || !username || !email || !password ||
        [name, username, email, password].some((index) => index?.trim() === "")
    ){
        throw new apiError(400, "All registeration fields are required!")
    }

    const existedUser = await User.findOne({
        $or: [
            { username },
            { email }
        ],
        is_registered: true
    })
    
    if(existedUser){
        throw new apiError(409, "User with similar username or email already exists")
    }
    anonuser.name = name;
    anonuser.email = email;
    anonuser.username = username;
    anonuser.password = password;

    const newRegisteredUser = await anonuser.save();
})