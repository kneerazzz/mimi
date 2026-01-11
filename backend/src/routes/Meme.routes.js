import { Router } from "express";
import { getHomeFeed, getMemeDetails, getTrendingMemes } from "../controllers/meme.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/homepage").get(
    getHomeFeed
)

router.route("/details/:contentId/:contentType").get(
    getMemeDetails
)

router.route("/trending-memes").get(
    getTrendingMemes
)

export default router;