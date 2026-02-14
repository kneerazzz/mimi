import { Router } from "express";
import { registerUser, resetPassword, loginUser, logoutUser, updateProfilePic, updateUserDetails, updateUserPassword, refreshAccessToken, getUserDetails, deleteUser, getUserProfile, sendPasswordResetEmail, } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.route("/register").post(
    registerUser
)
router.route("/login").post(
    loginUser
)
router.route("/logout").post(
    logoutUser
)
router.route("/update-user-details").patch(
    updateUserDetails
)
router.route("/update-user-password").patch(
    updateUserPassword
)
router.route("/refresh-access-token").post(
    refreshAccessToken
)
router.route("/get-user-details").get(
    getUserDetails
)
router.route("/change-profile-pic").patch(
    upload.single('profilePic'),
    updateProfilePic
)

router.route("/delete-account").delete(
    deleteUser
)
router.route("/get-user/:username").get(
    getUserProfile
)

router.route("/send-password-reset-email").post(
    sendPasswordResetEmail
)

router.route("/reset-password").post(
    resetPassword
)

export default router;