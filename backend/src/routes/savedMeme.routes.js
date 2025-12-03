import { Router } from "express";
import { toggleSave, getAllSavedMemes } from "../controllers/save.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/toggle-save/:contentId/:contentType").patch(
    verifyJwt,
    toggleSave
)

router.route("/get-saved-memes").get(
    verifyJwt, 
    getAllSavedMemes
)

export default router;