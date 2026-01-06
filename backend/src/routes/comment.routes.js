import { Router } from "express";
import { addComment, deleteComment, getAllComments, getCommentReplies, updateComment } from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add-comment/:contentId/:contentType").post(
    addComment
)

router.route("/update-comment/:commentId").patch(
    updateComment
)

router.route("/delete-comment/:commentId").delete(
    deleteComment
)
router.route("/get-all-comments/:contentId/:contentType").get(
    getAllComments
)

router.route("/get-comment-replies/:parentCommentId").get(
    getCommentReplies
)

export default router;