import { RequestHandler, Request, Response, NextFunction } from "express";
import { ParamsDictionary, Query } from "express-serve-static-core";
import { MulterError } from "multer";
import slugify from "slugify";
import Joi, { ValidationResult } from "joi";
import mongoose, { Schema } from "mongoose";

import Manga from "../models/Manga";
import { uploadMangaImage, uploadMangaPoster } from "../middlewares/multer";
import MangaEpisode from "../models/MangaEpisode";
import MangaBook from "../models/MangaBook";
import { AdminAuthRequest } from "../middlewares/verifyAdmin";

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

interface createMangaEpisodesRequest {
  episode: number;
  slug?: string;
  image: Express.Multer.File[];
  mangaID: Schema.Types.ObjectId;
}

const createMangaEpisodesRequestSchema = Joi.object({
  episode: Joi.number().required(),
  slug: Joi.string(),
  mangaID: Joi.string().required(),
});

export const createMangaEpisodes: RequestHandler<
  ParamsDictionary,
  unknown,
  createMangaEpisodesRequest,
  Query,
  Record<string, unknown>
> = async (
  req: Request<
    ParamsDictionary,
    unknown,
    createMangaEpisodesRequest,
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

      const { error, value }: ValidationResult<createMangaEpisodesRequest> =
        createMangaEpisodesRequestSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ message: "Validation error", error });
      }

      const imageArr = [];

      for (
        let i = 0;
        i < (Array.isArray(req.files) ? req.files.length : 0);
        i++
      ) {
        const file = Array.isArray(req.files)
          ? req.files[i]
          : req.files["image"][i];
        imageArr.push(`/uploads/${file.filename}`);
      }

      const episode = new MangaEpisode({
        episode: value.episode,
        images: imageArr,
        slug: value.slug ? value.slug : value.episode,
      });
      await episode.save();

      if (!req.body.mangaID) {
        return res.status(404).json({ message: "mangaID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(req.body.mangaID.toString())) {
        return res.status(400).json({ message: "Invalid mangaID" });
      }

      const updatedManga = await Manga.findByIdAndUpdate(
        req.body.mangaID.toString(),
        {
          $push: { episode: episode._id },
        }
      );
      res.status(200).json(updatedManga);
    });
  } catch (error) {
    next(error);
  }
};

interface createMangaBooksRequest {
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
  createMangaBooksRequest,
  Query,
  Record<string, unknown>
> = async (
  req: Request<
    ParamsDictionary,
    unknown,
    createMangaBooksRequest,
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

      const { error, value }: ValidationResult<createMangaBooksRequest> =
        createMangaBooksRequestSchema.validate(req.body);

      if (error) {
        return res.status(400).json({ message: "Validation error", error });
      }
      const imageArr = [];

      for (
        let i = 0;
        i < (Array.isArray(req.files) ? req.files.length : 0);
        i++
      ) {
        const file = Array.isArray(req.files)
          ? req.files[i]
          : req.files["image"][i];
        imageArr.push(`/public/images/${file.filename}`);
      }

      const book = new MangaBook({
        book: value.book,
        images: imageArr,
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
          $push: { book: book._id },
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
