import express, { Router } from "express";
import {
  createManga,
  createMangaBooks,
  createMangaChapters,
  deleteManga,
  deleteMangaBookById,
  getAllManga,
  getMangaBookDetail,
  getMangaById,
  getMangaBySlug,
  getMangaByTags,
} from "../controllers/manga";
import verifyAdmin from "../middlewares/verifyAdmin";

const router: Router = express.Router();
router.post("/create", verifyAdmin, createManga);
router.post("/create/chapter", verifyAdmin, createMangaChapters);
router.post("/create/book", verifyAdmin, createMangaBooks);
router.get("/", getAllManga);
router.get("/:slug", getMangaBySlug);
router.get("/book/:bookId", getMangaBookDetail);
router.get("/tags/:tag", getMangaByTags);
router.delete("/:id", verifyAdmin, deleteManga);
router.delete("/book/:mangaId/:bookId", verifyAdmin, deleteMangaBookById);
router.get("/id/:mangaId", verifyAdmin, getMangaById);
export default router;
