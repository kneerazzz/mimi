import { Router } from "express";
import { createMemeManually, previewMeme, createMemeWithAI, getAllCreatedMemes, editCreatedMeme, deleteCreatedMeme } from "../controllers/createMeme.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/preview-memes").get(
    verifyJwt,
    previewMeme
)

router.route("/meme-ai").post(
    verifyJwt,
    upload.single("memeImage"),
    createMemeWithAI
)

router.route("/meme-manually").post(
    verifyJwt,
    upload.single("memeImage"),
    createMemeManually
)

router.route("/user/:username").get(
    getAllCreatedMemes
)

router.route("/edit-meme/:memeId").patch(
    verifyJwt,
    editCreatedMeme
)

router.route("/delete-meme/:memeId").delete(
    verifyJwt,
    deleteCreatedMeme
)

export default router;