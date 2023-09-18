import multer, { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import path from "path";
import fs from "fs";

const storage = diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    const imagePath = path.join(__dirname, "..", "public", "images");

    fs.mkdirSync(imagePath, { recursive: true });
    cb(null, imagePath);
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const sanitizedName = file.originalname.replace(/ /g, "_");
    const uniqueFilename = `${sanitizedName}-${
      file.fieldname
    }-${uuidv4()}-${sanitizedName}`;
    cb(null, uniqueFilename);
  },
});

export const uploadMangaPosterMiddleware = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB
}).single("image");

export const uploadMangaImagesMiddleware = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB
}).array("image");
