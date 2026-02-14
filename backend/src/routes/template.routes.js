import { Router } from "express";
import { getAllUserTemplates, getRandomTemplates, getSingleTemplate, getSingleUserTemplate, getTemplatesByCategory, uploadTemplate, searchTemplates, updateUserTemplate, deleteUserTemplate } from "../controllers/template.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload-template").post(
    upload.single("templatePic"),
    uploadTemplate
)

router.route("/get-single-user-template/:templateId").get(
    getSingleUserTemplate
)

router.route("/get-user-templates").get(
    getAllUserTemplates
)

router.route("/get-template-details/:templateId").get(
    getSingleTemplate
)

router.route("/get-category-templates").get(
    getTemplatesByCategory
)

router.route("/get-random-templates").get(
    getRandomTemplates
)

router.route("/search-templates").get(
    searchTemplates
)

router.route("/update-template/:templateId").patch(
    updateUserTemplate
)

router.route("/delete-template/:templateId").delete(
    deleteUserTemplate
)


export default router;