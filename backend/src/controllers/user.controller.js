import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError} from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import uploadOnCloudinary from '../utils/fileUpload.js';
import deleteFromCloudinary from '../utils/fileDelete.js';
import { REFRESH_TOKEN_SECRET } from '../config/env.js';
import { Like } from '../models/like.model.js'
import { SavedMeme } from '../models/savedMeme.model.js';
import { Comment } from "../models/comment.model.js"
import { SavedTemplate } from '../models/savedTemplate.model.js';
import { CreatedMeme } from '../models/createdMeme.model.js';
import { UserTemplate } from '../models/user.template.model.js'
import { sendEmail } from '../utils/email.util.js';
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
        },
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
    .clearCookie("visitor_uuid", options)
    .json(
        new ApiResponse(200, {}, "User logout successful!")
    )
})

const getUserDetails = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user.is_registered){
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


const sendPasswordResetEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    //if the email is not of the current user give error 
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const currentUser = req.user;
    if(currentUser && !currentUser.is_registered){
        throw new ApiError(401, "Unauthorised access")
    }
    
    if(currentUser?.email && currentUser.email !== email.trim().toLowerCase()){
        throw new ApiError(403, "You can only request password reset for your own email")
    }

    const user = await User.findOne({
        email: email.trim().toLowerCase(),
    });

    if (!user) {
        throw new ApiError(404, "User with this email doesn't exist");
    }

    // 1. Generate 6-Digit OTP (100000 to 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Hash the OTP to store in Database
    // We store the hash so if the DB is leaked, the code is unknown.
    // When the user sends the code back, we hash it again and compare.
    user.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    // 3. Set Expiration (10 minutes)
    user.forgotPasswordExpiry = Date.now() + 10 * 60 * 1000;

    // 4. Save User
    await user.save({ validateBeforeSave: false });

    // 5. Professional HTML Email Design
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #09090b; margin: 0; padding: 0; color: #e4e4e7; }
        .container { max-width: 480px; margin: 40px auto; background-color: #18181b; border-radius: 12px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #9333ea 0%, #db2777 100%); padding: 30px; text-align: center; }
        .header h1 { margin: 0; color: white; font-size: 24px; font-weight: 800; letter-spacing: -1px; }
        .content { padding: 40px 30px; text-align: center; }
        .text { font-size: 16px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background-color: #27272a; border-radius: 8px; padding: 20px; margin: 0 auto 30px; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #fff; display: inline-block; border: 1px solid #3f3f46; }
        .footer { padding: 20px; background-color: #09090b; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
        .warning { font-size: 13px; color: #ef4444; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MIMI STUDIO</h1>
        </div>
        <div class="content">
          <p class="text">Hi <strong>${user.username || "Creator"}</strong>,<br>You requested to reset your password. Use the code below to proceed.</p>
          
          <div class="otp-box">${otp}</div>
          
          <p class="text">This code expires in 10 minutes.</p>
          <p class="warning">If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Mimi Studio. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject: "Your Mimi Password Reset Code",
            html: emailHtml, // Make sure your sendEmail utility supports 'html' key
        });

        return res.status(200).json(
            new ApiResponse(200, {}, "Reset code sent to your email")
        );
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, "Email could not be sent. Please try again later.");
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP and new password are required");
    }

    const user = await User.findOne({
        email: email.trim().toLowerCase(),
        forgotPasswordToken: crypto.createHash("sha256").update(otp).digest("hex"),
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successful")
    );
});
const updateUserDetails = asyncHandler(async(req, res) => {
    const {name , username, bio, email} = req.body;
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorised access")
    }
    if(!username && !name && !bio, !email){
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
    }
    const updateData = {};
    if(username) updateData.username = username.trim().toLowerCase();
    if(name) updateData.name = name.trim();
    if(bio) updateData.bio = bio;
    if(email) updateData.email = email.trim().toLowerCase();
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

const getUserProfile = asyncHandler(async(req, res) => {
    const { username } = req.params;

    if(!username?.trim()){
        throw new ApiError(400, "Username is required")
    }

    // 1. Find the User (Case-insensitive search is better for URLs)
    const user = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") } 
    }).select("-password -refreshToken -email -__v");

    if(!user){
        throw new ApiError(404, "User not found")
    }

    // 2. Fetch User Stats (Optional but recommended for Profiles)
    // Counts how many memes this user has uploaded/created
    const memeCount = await CreatedMeme.countDocuments({ creator: user._id });

    // 3. Combine Data
    const userProfile = {
        ...user.toObject(),
        stats: {
            memesCreated: memeCount,
            // You can add followers/following counts here later
        }
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, { user: userProfile }, "User profile fetched successfully")
    )
});

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
    if(!user.is_registered){
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
    deleteUser,
    getUserProfile,
    sendPasswordResetEmail,
    resetPassword
}