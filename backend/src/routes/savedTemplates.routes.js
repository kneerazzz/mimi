import { Router } from "express";
import { getAllSavedTemplates, toggleSave } from "../controllers/saveTemplate.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/toggle-save-template/:templateId").patch(
    verifyJwt,
    toggleSave
)

router.route("/get-saved-templates").get(
    verifyJwt,
    getAllSavedTemplates
)

export default router;