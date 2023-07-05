import { RequestHandler, Request, Response, NextFunction } from "express";
import { ParamsDictionary, Query } from "express-serve-static-core";
import slugify from "slugify";
import Joi, { ValidationResult } from "joi";
import mongoose, { Schema } from "mongoose";

import Manga from "../models/Manga";
import { uploadMangaImage, uploadMangaPoster } from "../middlewares/multer";
import MangaChapter from "../models/MangaChapter";
import MangaBook from "../models/MangaBook";
import { AdminAuthRequest } from "../middlewares/verifyAdmin";
import { MulterError } from "multer";

const createMangaSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  image: Joi.string(),
  tagList: Joi.array().items(Joi.string()),
  slug: Joi.string(),
});

interface CreateMangaRequest {
  title: string;
  description?: string;
  image?: Express.Multer.File;
  tagList?: string[];
  slug?: string;
}

export const createManga: RequestHandler<
  ParamsDictionary,
  unknown,
  CreateMangaRequest,
  Query,
  Record<string, unknown>
> = async (
  req: Request<
    ParamsDictionary,
    unknown,
    CreateMangaRequest,
    Query,
    Record<string, unknown>
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    uploadMangaPoster(req, res, async function (err) {
      if (err instanceof MulterError) {
        console.error(err);
        return res
          .status(400)
          .json({ message: "File upload error", error: err.message });
      } else if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }

      const { error, value }: ValidationResult<CreateMangaRequest> =
        createMangaSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ message: "Validation error", error: error.details });
      }

      const newReq = req as unknown as AdminAuthRequest;

      const slug = slugify(value.slug || value.title || "", {
        lower: true,
        replacement: "-",
      });

      const existingSlug = await Manga.findOne({ slug });

      if (existingSlug) {
        return res.status(409).json({ message: "Manga slug already exists" });
      }

      const mangaData = {
        title: value.title,
        description: value.description,
        image: `/public/images/${req.file?.filename}`,
        tagList: value.tagList,
        slug: slug,
        uploader: newReq.userId,
      };

      const manga = await Manga.create(mangaData);

      res.status(200).json({ manga });
    });
  } catch (error) {
    next(error);
  }
};

interface CreateMangaChaptersRequest {
  chapter: number;
  slug?: string;
  image: Express.Multer.File[];
  mangaID: Schema.Types.ObjectId;
}

const createMangaChaptersRequestSchema = Joi.object({
  chapter: Joi.number().required(),
  slug: Joi.string(),
  mangaID: Joi.string().required(),
});

export const createMangaChapters: RequestHandler<
  ParamsDictionary,
  unknown,
  CreateMangaChaptersRequest,
  Query,
  Record<string, unknown>
> = async (
  req: Request<
    ParamsDictionary,
    unknown,
    CreateMangaChaptersRequest,
    Query,
    Record<string, unknown>
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    uploadMangaImage(req, res, async function (err) {
      if (err instanceof MulterError) {
        console.error(err);
        return res
          .status(400)
          .json({ message: "File upload error", error: err.message });
      } else if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
      const { error, value }: ValidationResult<CreateMangaChaptersRequest> =
        createMangaChaptersRequestSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ message: "Validation error", error });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const imageArr = Array.isArray(req.files)
        ? req.files
        : [req.files["image"]].flat();

      const imageUrls = imageArr.map(
        (file) => `/public/images/${file.filename}`
      );
      const chapter = new MangaChapter({
        chapter: value.chapter,
        images: imageUrls,
        slug: value.slug ? value.slug : value.chapter,
      });
      await chapter.save();

      if (!req.body.mangaID) {
        return res.status(404).json({ message: "mangaID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(req.body.mangaID.toString())) {
        return res.status(400).json({ message: "Invalid mangaID" });
      }

      const updatedManga = await Manga.findByIdAndUpdate(
        req.body.mangaID.toString(),
        {
          $push: { chapter: chapter._id },
        }
      );

      res.status(200).json(updatedManga);
    });
  } catch (error) {
    next(error);
  }
};

interface CreateMangaBooksRequest {
  book: number;
  slug?: string;
  image: Express.Multer.File[];
  mangaID: Schema.Types.ObjectId;
}

const createMangaBooksRequestSchema = Joi.object({
  book: Joi.number().required(),
  slug: Joi.string(),
  mangaID: Joi.string().required(),
});

export const createMangaBooks: RequestHandler<
  ParamsDictionary,
  unknown,
  CreateMangaBooksRequest,
  Query,
  Record<string, unknown>
> = async (
  req: Request<
    ParamsDictionary,
    unknown,
    CreateMangaBooksRequest,
    Query,
    Record<string, unknown>
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    uploadMangaImage(req, res, async function (err) {
      if (err instanceof MulterError) {
        console.error(err);
        return res
          .status(400)
          .json({ message: "File upload error", error: err.message });
      } else if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const { error, value }: ValidationResult<CreateMangaBooksRequest> =
        createMangaBooksRequestSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ message: "Validation error", error });
      }

      const imageArr = Array.isArray(req.files)
        ? req.files
        : [req.files["image"]].flat();

      const imageUrls = imageArr.map(
        (file) => `/public/images/${file.filename}`
      );

      const book = new MangaBook({
        book: value.book,
        images: imageUrls,
        slug: value.slug ? value.slug : value.book,
      });

      await book.save();

      if (!req.body.mangaID) {
        return res.status(404).json({ message: "mangaID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(req.body.mangaID.toString())) {
        return res.status(400).json({ message: "Invalid mangaID" });
      }

      const updatedManga = await Manga.findByIdAndUpdate(
        req.body.mangaID.toString(),
        {
          $push: { books: book._id },
        }
      );
      res.status(200).json(updatedManga);
    });
  } catch (error) {
    next(error);
  }
};

export const getAllManga: RequestHandler = async (req, res, next) => {
  try {
    const mangas = await Manga.find().sort({ createdAt: "desc" });
    res.status(200).json(mangas);
  } catch (error) {
    next(error);
  }
};

export const getMangaBySlug: RequestHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const manga = await Manga.findOne({ slug: slug });
    if (!manga) {
      return res.status(404).json({ message: "Manga not found" });
    }
    return res.status(200).json({ manga });
  } catch (error) {
    next(error);
  }
};

export const getMangaById: RequestHandler = async (req, res, next) => {
  try {
    const { mangaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(mangaId.toString())) {
      return res.status(400).json({ message: "Invalid mangaId" });
    }

    const manga = await Manga.findById(mangaId);
    if (!manga) {
      return res.status(404).json({ message: "Manga not found" });
    }
    return res.status(200).json({ manga });
  } catch (error) {
    next(error);
  }
};

interface GetMangaBookDetailParams {
  bookId: string;
}

export const getMangaBookDetail: RequestHandler<
  GetMangaBookDetailParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await MangaBook.findById(bookId);
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

interface GetMangaByTagsParams {
  tag: string;
}

export const getMangaByTags: RequestHandler<
  GetMangaByTagsParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const manga = await Manga.find({ tagList: { $in: tag.split(",") } }).sort({
      createdAt: "desc",
    });
    res.status(200).json(manga);
  } catch (error) {
    next(error);
  }
};

export const deleteManga: RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  Record<string, unknown>
> = async (
  req: Request<
    ParamsDictionary,
    unknown,
    unknown,
    Query,
    Record<string, unknown>
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid manga ID" });
    }

    const deletedManga = await Manga.findByIdAndDelete(id);

    if (!deletedManga) {
      return res.status(404).json({ message: "Manga not found" });
    }

    return res.status(200).json({ message: "Delete successfully!" });
  } catch (error) {
    next(error);
  }
};
