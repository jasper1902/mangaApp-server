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
  handleMangaChaptersCreation,
  handleMangaCreation,
  updateMangaDetails,
} from "../controllers/manga";
import verifyAdmin from "../middlewares/verifyAdmin";

const router: Router = express.Router();
router.post("/create", verifyAdmin, handleMangaCreation);
router.post("/create/chapter", verifyAdmin, handleMangaChaptersCreation);
router.post("/create/book", verifyAdmin, handleCreateMangaBooks);
router.get("/", handleGetAllManga);
router.get("/:slug", handleGetMangaBySlug);
router.get("/book/:bookId", getMangaBookDetail);
router.get("/tags/:tag", getMangaByTags);
router.delete("/:mangaId", verifyAdmin, handleMangaDeletion);
router.delete("/book/:mangaId/:bookId", verifyAdmin, deleteMangaBookById);
router.get("/id/:mangaId", verifyAdmin, getMangaById);
router.put("/update/:mangaId", verifyAdmin, updateMangaDetails);
export default router;
