import { Router } from "express";
import { createMemeManually, previewMeme, createMemeWithAI } from "../controllers/createMeme.controller.js";

const router = Router();


router.route("/preview-memes").get(
    previewMeme
)

router.route("/meme-ai").post(
    createMemeWithAI
)

router.route("/meme-manually").post(
    createMemeManually
)

export default router;