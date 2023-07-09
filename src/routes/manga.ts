import express, { Router } from "express";
import {
  handleMangaDeletion,
  deleteMangaBookById,
  getMangaBookDetail,
  handleCreateMangaBooks,
  handleGetAllManga,
  getMangaByTags,
  getMangaById,
  handleGetMangaBySlug,
  handleMangaCreation,
  updateMangaDetails,
  getMangaBookBySlug,
} from "../controllers/manga";
import verifyAdmin from "../middlewares/verifyAdmin";

const router: Router = express.Router();
router.post("/create", verifyAdmin, handleMangaCreation);
router.post("/create/book", verifyAdmin, handleCreateMangaBooks);
router.get("/", handleGetAllManga);
router.get("/:slug", handleGetMangaBySlug);
router.get("/book/:bookId", getMangaBookDetail);
router.get("/book-slug/:bookSlug", getMangaBookBySlug);
router.get("/tags/:tag", getMangaByTags);
router.delete("/:mangaId", verifyAdmin, handleMangaDeletion);
router.delete("/book/:mangaId/:bookId", verifyAdmin, deleteMangaBookById);
router.get("/id/:mangaId", verifyAdmin, getMangaById);
router.put("/update/:mangaId", verifyAdmin, updateMangaDetails);
export default router;
