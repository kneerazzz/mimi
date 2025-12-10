import { Router } from "express";
import { registerUser, loginUser, logoutUser, updateProfilePic, updateUserDetails, updateUserPassword, refreshAccessToken, getUserDetails, deleteUser, } from "../controllers/user.controller.js";
import handelNewVisitor from "../middlewares/handleNewVisitor.middleware.js";
import { verifyJwt } from '../middlewares/auth.middleware.js'
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.route("/register").post(
    handelNewVisitor,
    registerUser
)
router.route("/login").post(
    loginUser
)
router.route("/logout").post(
    verifyJwt,
    logoutUser
)
router.route("/update-user-details").patch(
    verifyJwt,
    updateUserDetails
)
router.route("/update-user-password").patch(
    verifyJwt,
    updateUserPassword
)
router.route("/refresh-access-token").patch(
    verifyJwt,
    refreshAccessToken
)
router.route("/get-user-details").get(
    verifyJwt,
    getUserDetails
)
router.route("/change-profile-pic").patch(
    verifyJwt,
    upload.single('profilePic'),
    updateProfilePic
)
router.route("/delete-user").delete(
    verifyJwt,
    deleteUser
)

export default router;