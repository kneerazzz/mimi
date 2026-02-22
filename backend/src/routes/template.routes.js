import { Router } from "express";
import { getAllUserTemplates, getRandomTemplates, getSingleTemplate, getSingleUserTemplate, getTemplatesByCategory, uploadTemplate, searchTemplates, updateUserTemplate, deleteUserTemplate } from "../controllers/template.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/upload-template").post(
    verifyJwt,
    upload.single("templatePic"),
    uploadTemplate
)

router.route("/get-single-user-template/:templateId").get(
    verifyJwt,
    getSingleUserTemplate
)

router.route("/get-user-templates").get(
    verifyJwt,
    getAllUserTemplates
)

router.route("/get-template-details/:templateId").get(
    verifyJwt,
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
    verifyJwt,
    updateUserTemplate
)

router.route("/delete-template/:templateId").delete(
    verifyJwt,
    deleteUserTemplate
)


export default router;