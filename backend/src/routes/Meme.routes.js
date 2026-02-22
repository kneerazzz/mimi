import { Router } from "express";
import { getHomeFeed,searchMemes, getMemeDetails, getNewestMemes, getTrendingMemes } from "../controllers/meme.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/homepage").get(
    verifyJwt,
    getHomeFeed
)

router.route("/details/:contentId/:contentType").get(
    verifyJwt,
    getMemeDetails
)

router.route("/trending-memes").get(
    verifyJwt,
    getTrendingMemes
)
router.route("/latest-memes").get(
    verifyJwt,
    getNewestMemes
)
router.route("/search-memes").get(
    searchMemes
)

export default router;