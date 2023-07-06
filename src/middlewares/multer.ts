import multer, { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
const storage = diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    cb(
      null,
      "/../Users/Jasper/Documents/GitHub/mangaApp-client/src/assets/public/images"
    );
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const sanitizedName = file.originalname.replace(/ /g, "_");
    const uniqueFilename = `${file.fieldname}-${uuidv4()}-${sanitizedName}`;
    cb(null, uniqueFilename);
  },
});

export const uploadMangaPosterMiddleware = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 500 }, // 5 MB
}).single("image");

export const uploadMangaImagesMiddleware = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 500 }, // 5 MB
}).array("image");
