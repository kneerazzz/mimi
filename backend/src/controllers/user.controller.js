import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError} from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import uploadOnCloudinary from '../utils/fileUpload.js';
import deleteFromCloudinary from '../utils/fileDelete.js';
import { REFRESH_TOKEN_SECRET } from '../config/env.js';
import { Like } from '../models/like.model.js'
import { SavedMeme } from '../models/savedMeme.model.js';
import { Comment } from "../models/comment.model.js"
import { SavedTemplate } from '../models/savedTemplate.model.js';
import { CreatedMeme } from '../models/createdMeme.model.js';
import { UserTemplate } from '../models/user.template.model.js'
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

const loginUser = asyncHandler(async(req, res) => {
    const {username, email, password} = req.body;
    if(!username && !email || !password){
        throw new ApiError(400, "All fields are required!")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }],
        is_registered: true
    })
    if(!user){
        throw new ApiError(409, "User with this username or email doesn't exist")
    }
    const isMatch = await user.isPasswordCorrect(password)
    if(!isMatch){
        throw new ApiError(401, "Incorrect password")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select(
        "-password -accessToken"
    )
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
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
        new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }),
        "User logged in successfully"
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorised access")
    }
    await User.findByIdAndUpdate(user._id, {
        $unset: {
            refreshToken: 1
        }
    }, {
        new: true
    })
    const options = {
        httpOnly: true,
        sameSite: "none",
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logout successful!")
    )
})

const getUserDetails = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorised access")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {user: user}, "User details fetched successfully")
    )
})

const updateUserPassword = asyncHandler(async(req, res) => {
    const { newPassword } = req.body;
    if(!newPassword){
        throw new ApiError(400, "new password required")
    }
    const user = req.user;
    if(!user){
        throw new ApiError(401,"Unauthorised access")
    }
    user.password = newPassword;
    await user.save();
    const updatedUser = await User.findById(user._id).select("-password -refreshToken")
    return res
    .status(200)
    .json(new ApiResponse(200, {user: updatedUser}, "Password changed successfully"))
})

const updateUserDetails = asyncHandler(async(req, res) => {
    const {name , username, bio} = req.body;
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorised access")
    }
    if(!username && !name && !bio){
        throw new ApiError(400, "Nothing to update here")
    }
    if(username){
        const normalizedUsername = username.trim().toLowerCase();
        if(normalizedUsername !== req.user?.username){
            const existingUser = await User.findOne({username})
            if(existingUser){
                throw new ApiError(403, "User with similar username already exists")
            }
        }
        else {
            throw new ApiError(400, "Enter new Username")
        }
    }
    const updateData = {};
    if(username) updateData.username = username.trim().toLowerCase();
    if(name) updateData.name = name.trim();
    if(bio) updateData.bio = bio;
    const updatedUser = await User.findByIdAndUpdate(user._id, {
        $set: updateData
    }, {new: true}).select("-password -refreshToken")
    
    if(!updatedUser){
        throw new ApiError(500, "Something went wrong while updating details!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, {user: updatedUser}, "User Details updated successfully")
    )
})
const updateProfilePic = asyncHandler(async(req, res) => {
    const profilePicLocalPath = req.file?.path;
    if(!profilePicLocalPath){
        throw new ApiError(400, "Bad request")
    }
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorised action")
    }
    const profilePic = await uploadOnCloudinary(profilePicLocalPath)
    if(profilePic.url === ""){
        throw new ApiError(500, "Error uploading files")
    }
    if(user.profilePic){
        await deleteFromCloudinary(user.profilePic)
    }
    user.profilePic = profilePic.url
    await user.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            user: user.profilePic
        }, "Profile Picture updated successfully")
    )

})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
        user.refreshToken = refreshToken

        await user.save({validateBeforeSave: true})
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
            new ApiResponse(200, {}, "Access token refreshed successfully")
        )

    }catch(error){
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const deleteUser = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user || !user.is_registered){
        throw new ApiError(401, "Unauthorised access!")
    }
    const { username , password } = req.body;
    if(!username || !password ){
        throw new ApiError(400, "Username and Password required to Delete Account")
    }
    if(username !== user.username){
        throw new ApiError(401, "Invalid credentials. Username doesn't match the loggedIn user")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid credentials. Password is incorrect")
    }
    await Promise.all([
        await Like.deleteMany({user: user._id}),
        await Comment.deleteMany({user: user._id}),
        await SavedMeme.deleteMany({user: user._id}),
        await SavedTemplate.deleteMany({user: user._id}),
        await CreatedMeme.deleteMany({creator: user._id}),
        await UserTemplate.deleteMany({submittedBy: user._id})
    ]);
    const deletedUserResult = await User.deleteOne({ _id: user._id });
    if(deletedUserResult.deletedCount === 0){
        throw new ApiError(500, "Account deletion failed in database")
    }
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User account deleted Successfully1")
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    updateUserPassword,
    updateUserDetails,
    updateProfilePic,
    refreshAccessToken,
    getUserDetails,
    deleteUser
}