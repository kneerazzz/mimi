import { Router } from "express";
import { getAllUserTemplates, getRandomTemplates, getSingleTemplate, getSingleUserTemplate, getTemplatesByCategory, uploadTemplate } from "../controllers/template.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload-template").post(
    upload.single("templatePic"),
    uploadTemplate
)

router.route("/get-single-user-template").get(
    getSingleUserTemplate
)

router.route("/get-user-templates").get(
    getAllUserTemplates
)

router.route("/get-template-details").get(
    getSingleTemplate
)

router.route("/get-category-templates").get(
    getTemplatesByCategory
)

router.route("/get-random-templates").get(
    getRandomTemplates
)

export default router;