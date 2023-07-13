import express, { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import {
  addCommentsToManga,
  deleteCommentFromManga,
  getCommentsFromManga,
} from "../controllers/comment";

const router: Router = express.Router();

router.post("/create/:mangaSlug", verifyJWT, addCommentsToManga);
router.get("/get/:mangaSlug", getCommentsFromManga);
router.delete(
  "/delete/:mangaSlug/:commentId",
  verifyJWT,
  deleteCommentFromManga
);

export default router;
