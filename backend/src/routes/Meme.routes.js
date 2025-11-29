import { Router } from "express";
import { getHomeFeed } from "../controllers/meme.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/homepage").get(
    verifyJwt,
    getHomeFeed
)

export default router;