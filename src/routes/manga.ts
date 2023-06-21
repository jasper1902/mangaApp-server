import express, { Router } from "express";
import {
  createManga,
  createMangaBooks,
  createMangaEpisodes,
  getAllManga,
} from "../controllers/manga";
import verifyAdmin from "../middlewares/verifyAdmin";

const router: Router = express.Router();
router.post("/create", verifyAdmin, createManga);
router.post("/create/episode", verifyAdmin, createMangaEpisodes);
router.post("/create/book", verifyAdmin, createMangaBooks);
router.get("/", getAllManga);

export default router;
