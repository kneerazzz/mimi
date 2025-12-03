import { Router } from "express";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add-comment/:contentId/:contentType").post(
    verifyJwt,
    addComment
)

router.route("/update-comment/:commentId").patch(
    verifyJwt,
    updateComment
)

router.route("/delete-comment/:commentId").delete(
    verifyJwt,
    deleteComment
)
router.route("/get-all-comments/:contentId/:contentType").get(
    verifyJwt,
    getAllComments
)

export default router;