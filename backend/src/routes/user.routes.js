import { Router } from "express";
import { registerUser, loginUser, logoutUser, updateProfilePic, updateUserDetails, updateUserPassword, refreshAccessToken, getUserDetails, deleteUser, } from "../controllers/user.controller.js";
import handelNewVisitor from "../middlewares/handleNewVisitor.middleware.js";
import { verifyJwt } from '../middlewares/auth.middleware.js'
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
router.route("/delete-user").delete(
    deleteUser
)

export default router;