import { Router } from "express";
import { getAllLikedMemes, toggleLike } from "../controllers/like.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/toggle-like/:contentId/:contentType").patch(
    verifyJwt,
    toggleLike
)

router.route("/get-liked-memes").get(
    verifyJwt,
    getAllLikedMemes
)

export default router;