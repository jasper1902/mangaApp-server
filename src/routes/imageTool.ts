import express, { Router } from "express";

import verifyJWT from "../middlewares/verifyJWT";
import { scrapingImages } from "../controllers/imageTool";

const router: Router = express.Router();

router.post("/test", verifyJWT, scrapingImages);

export default router;
