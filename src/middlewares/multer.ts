import multer, { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
const storage = diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, "./src/public/images");
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    const sanitizedName = file.originalname.replace(/ /g, "_");
    const uniqueFilename = `${file.fieldname}-${uuidv4()}-${sanitizedName}`;
    cb(null, uniqueFilename);
  },
});

export const uploadMangaImage = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 500 }, // 5 MB
  }).array("image");
  
  export const uploadMangaPoster = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 500 }, // 5 MB
  }).single("image");
  