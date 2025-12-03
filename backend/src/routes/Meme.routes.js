import { Router } from "express";
import { getHomeFeed, getMemeDetails } from "../controllers/meme.controller.js";
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

export default router;