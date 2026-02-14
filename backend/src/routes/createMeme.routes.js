import { Router } from "express";
import { createMemeManually, previewMeme, createMemeWithAI, getAllCreatedMemes, editCreatedMeme, deleteCreatedMeme } from "../controllers/createMeme.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();


router.route("/preview-memes").get(
    previewMeme
)

router.route("/meme-ai").post(
    upload.single("memeImage"),
    createMemeWithAI
)

router.route("/meme-manually").post(
    upload.single("memeImage"),
    createMemeManually
)

router.route("/user/:username").get(
    getAllCreatedMemes
)

router.route("/edit-meme/:memeId").patch(
    editCreatedMeme
)

router.route("/delete-meme/:memeId").delete(
    deleteCreatedMeme
)

export default router;