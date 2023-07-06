import { RequestHandler, Request, Response, NextFunction } from "express";
import { ParamsDictionary, Query } from "express-serve-static-core";
import slugify from "slugify";
import Joi, { ValidationResult } from "joi";
import mongoose, { Schema } from "mongoose";

import Manga from "../models/Manga";
import {
  uploadMangaImagesMiddleware,
  uploadMangaPosterMiddleware,
} from "../middlewares/multer";
import MangaChapter from "../models/MangaChapter";
import MangaBook from "../models/MangaBook";
import { AdminAuthRequest } from "../middlewares/verifyAdmin";
import { MulterError } from "multer";
import { deleteImageMiddleware } from "../middlewares/deleteImage";
import User from "../models/User";

const mangaValidationSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  image: Joi.string(),
  tagList: Joi.array().items(Joi.string()),
  slug: Joi.string(),
});

interface MangaCreationRequest {
  title: string;
  description?: string;
  image?: Express.Multer.File;
  tagList?: string[];
  slug?: string;
}

export const handleMangaCreation: RequestHandler<
  ParamsDictionary,
  unknown,
  MangaCreationRequest,
  Query,
  Record<string, unknown>
> = async (
  req: Request<
    ParamsDictionary,
    unknown,
    MangaCreationRequest,
    Query,
    Record<string, unknown>
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    uploadMangaPosterMiddleware(
      req,
      res,
      async function handleMangaPosterUpload(err) {
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

        const { error, value }: ValidationResult<MangaCreationRequest> =
          mangaValidationSchema.validate(req.body);
        if (error) {
          return res
            .status(400)
            .json({ message: "Validation error", error: error.details });
        }

        const adminAuthRequest = req as unknown as AdminAuthRequest;

        const mangaSlug = slugify(value.slug || value.title || "", {
          lower: true,
          replacement: "-",
        });

        const existingMangaSlug = await Manga.findOne({ slug: mangaSlug });

        if (existingMangaSlug) {
          return res.status(409).json({ message: "Manga slug already exists" });
        }

        const newMangaData = {
          title: value.title,
          description: value.description,
          image: `/public/images/${req.file?.filename}`,
          tagList: value.tagList,
          slug: mangaSlug,
          uploader: adminAuthRequest.userId,
          lastEditor: adminAuthRequest.userId,
        };

        const createdManga = await Manga.create(newMangaData);

        res.status(200).json({ manga: createdManga });
      }
    );
  } catch (error) {
    next(error);
  }
};

interface MangaChaptersCreationRequest {
  chapter: number;
  slug?: string;
  images: Express.Multer.File[];
  mangaID: Schema.Types.ObjectId;
}

const mangaChaptersValidationSchema = Joi.object({
  chapter: Joi.number().required(),
  slug: Joi.string(),
  mangaID: Joi.string().required(),
});

export const handleMangaChaptersCreation: RequestHandler<
  ParamsDictionary,
  unknown,
  MangaChaptersCreationRequest,
  Query,
  Record<string, unknown>
> = async (
  req: Request<
    ParamsDictionary,
    unknown,
    MangaChaptersCreationRequest,
    Query,
    Record<string, unknown>
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    uploadMangaImagesMiddleware(
      req,
      res,
      async function handleMangaImagesUpload(err) {
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

        const { error, value }: ValidationResult<MangaChaptersCreationRequest> =
          mangaChaptersValidationSchema.validate(req.body);

        if (error) {
          return res.status(400).json({ message: "Validation error", error });
        }

        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadedImagesArray = Array.isArray(req.files)
          ? req.files
          : [req.files["image"]].flat();

        const uploadedImageUrls = uploadedImagesArray.map(
          (file) => `/public/images/${file.filename}`
        );
        const newMangaChapter = new MangaChapter({
          chapter: value.chapter,
          images: uploadedImageUrls,
          slug: value.slug ? value.slug : value.chapter.toString(),
        });
        await newMangaChapter.save();

        if (!req.body.mangaID) {
          return res.status(404).json({ message: "mangaID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(req.body.mangaID.toString())) {
          return res.status(400).json({ message: "Invalid mangaID" });
        }

        const updatedMangaEntry = await Manga.findByIdAndUpdate(
          req.body.mangaID.toString(),
          {
            $push: { chapters: newMangaChapter._id },
          }
        );

        res.status(200).json(updatedMangaEntry);
      }
    );
  } catch (error) {
    next(error);
  }
};

interface CreateMangaBooksRequest {
  book: number;
  slug?: string;
  image: Express.Multer.File[];
  mangaID: Schema.Types.ObjectId;
  title: string;
}

const createMangaBooksRequestSchema = Joi.object({
  book: Joi.number().required(),
  slug: Joi.string(),
  mangaID: Joi.string().required(),
  title: Joi.string().required(),
});

export const handleCreateMangaBooks: RequestHandler<
  ParamsDictionary,
  unknown,
  CreateMangaBooksRequest,
  Query,
  Record<string, unknown>
> = async (request, response, nextFunction) => {
  try {
    uploadMangaImagesMiddleware(request, response, async function (err) {
      console.log(request.body);
      if (err instanceof MulterError) {
        console.error(err);
        return response
          .status(400)
          .json({ message: "File upload error", error: err.message });
      } else if (err) {
        console.error(err);
        return response
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
      if (!request.files || request.files.length === 0) {
        return response.status(400).json({ message: "No files uploaded" });
      }
      const authenticatedRequest = request as unknown as AdminAuthRequest;

      const { error, value }: ValidationResult<CreateMangaBooksRequest> =
        createMangaBooksRequestSchema.validate(request.body);

      if (error) {
        return response
          .status(400)
          .json({ message: "Validation error", error });
      }

      const imageArray = Array.isArray(request.files)
        ? request.files
        : [request.files["image"]].flat();

      const uploadedImageUrls = imageArray.map(
        (file) => `/public/images/${file.filename}`
      );

      const newMangaBook = new MangaBook({
        book: value.book,
        images: uploadedImageUrls,
        slug: value.slug ? value.slug : value.book,
        author: authenticatedRequest.userId,
        title: value.title,
      });

      await newMangaBook.save();

      if (!request.body.mangaID) {
        return response.status(404).json({ message: "mangaID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(request.body.mangaID.toString())) {
        return response.status(400).json({ message: "Invalid mangaID" });
      }

      await Manga.findByIdAndUpdate(request.body.mangaID.toString(), {
        $push: { books: newMangaBook._id },
      });
      response.status(200).json({ message: "Create manga book successfully" });
    });
  } catch (error) {
    nextFunction(error);
  }
};

export const handleGetAllManga: RequestHandler = async (
  request,
  response,
  next
) => {
  try {
    const allMangas = await Manga.find().sort({ createdAt: "desc" });
    response.status(200).json(allMangas);
  } catch (error) {
    next(error);
  }
};

export const handleGetMangaBySlug: RequestHandler = async (
  request,
  response,
  next
) => {
  try {
    const { slug } = request.params;
    const foundManga = await Manga.findOne({ slug: slug });
    if (!foundManga) {
      return response.status(404).json({ message: "Manga not found" });
    }
    response.status(200).json({ manga: foundManga });
  } catch (error) {
    next(error);
  }
};

export const getMangaById: RequestHandler = async (request, response, next) => {
  try {
    const { mangaId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(mangaId.toString())) {
      return response.status(400).json({ message: "Invalid mangaId" });
    }

    const retrievedManga = await Manga.findById(mangaId);
    if (!retrievedManga) {
      return response.status(404).json({ message: "Manga not found" });
    }

    response.status(200).json({ manga: retrievedManga });
  } catch (error) {
    next(error);
  }
};

interface MangaBookByIdParams {
  bookId: string;
}

export const getMangaBookDetail: RequestHandler<
  MangaBookByIdParams,
  unknown,
  unknown,
  unknown
> = async (request, response, next) => {
  try {
    const { bookId } = request.params;
    const bookDetails = await MangaBook.findById(bookId);
    response.status(200).json(bookDetails);
  } catch (error) {
    next(error);
  }
};

interface MangaByTagsParams {
  tags: string;
}

export const getMangaByTags: RequestHandler<
  MangaByTagsParams,
  unknown,
  unknown,
  unknown
> = async (request, response, next) => {
  try {
    const { tags } = request.params;
    const matchingMangaList = await Manga.find({
      tagList: { $in: tags.split(",") },
    }).sort({
      createdAt: "desc",
    });
    response.status(200).json(matchingMangaList);
  } catch (error) {
    next(error);
  }
};

export const handleMangaDeletion: RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  Record<string, unknown>
> = async (request, response, next) => {
  try {
    const { mangaId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(mangaId)) {
      return response.status(400).json({ message: "Invalid manga ID" });
    }

    const removedManga = await Manga.findByIdAndDelete(mangaId);

    if (!removedManga) {
      return response.status(404).json({ message: "Manga not found" });
    }
    const existingImageURLs = [removedManga.image].filter(Boolean) as string[];
    deleteImageMiddleware(existingImageURLs);

    return response.status(200).json({ message: "Deletion successful!" });
  } catch (catchedError) {
    next(catchedError);
  }
};

export const deleteMangaBookById: RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  Record<string, unknown>
> = async (req, res, next) => {
  try {
    const { bookId, mangaId } = req.params;

    const areValidIds =
      mongoose.Types.ObjectId.isValid(bookId) &&
      mongoose.Types.ObjectId.isValid(mangaId);
    if (!areValidIds) {
      return res.status(400).json({ message: "Invalid manga ID" });
    }

    const foundManga = await Manga.findById(mangaId);
    if (!foundManga || !foundManga.books) {
      return res.status(404).json({ message: "MangaBook not found" });
    }

    foundManga.books = foundManga.books.filter(
      (book) => book.toString() !== bookId
    );
    await foundManga.save();

    const deletedBook = await MangaBook.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({ message: "Manga not found" });
    }

    deleteImageMiddleware(deletedBook.images);

    return res.status(200).json({ message: "Deletion successful!" });
  } catch (error) {
    next(error);
  }
};

const mangaUpdateSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  image: Joi.string(),
  tagList: Joi.array().items(Joi.string()),
  slug: Joi.string(),
});

interface MangaUpdateRequest {
  title: string;
  description?: string;
  image?: Express.Multer.File;
  tagList?: string[];
  slug?: string;
}

export const updateMangaDetails: RequestHandler<
  ParamsDictionary,
  unknown,
  MangaUpdateRequest,
  Query,
  Record<string, unknown>
> = async (req, res, next) => {
  try {
    uploadMangaPosterMiddleware(
      req,
      res,
      async function handleUploadMangaPoster(err) {
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
        const { mangaId } = req.params;
        const { error, value }: ValidationResult<MangaUpdateRequest> =
          mangaUpdateSchema.validate(req.body);
        if (error) {
          return res
            .status(400)
            .json({ message: "Validation error", error: error.details });
        }

        const adminAuthReq = req as unknown as AdminAuthRequest;

        const slug = slugify(value.slug || value.title || "", {
          lower: true,
          replacement: "-",
        });

        const foundManga = await Manga.findById(mangaId);

        if (!foundManga) {
          return res.status(404).json({ message: "Manga not found" });
        }

        const user = await User.findById(adminAuthReq.userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const existingImageURLs = [foundManga.image].filter(
          Boolean
        ) as string[];
        deleteImageMiddleware(existingImageURLs);

        foundManga.title = value.title;
        foundManga.description = value.description;
        foundManga.image = req.file?.filename
          ? `/public/images/${req.file?.filename}`
          : foundManga?.image;
        foundManga.tagList = value.tagList;
        foundManga.slug = slug;
        foundManga.lastEditor = user._id;
        await foundManga.save();

        res
          .status(200)
          .json({ message: "Manga details updated successfully!" });
      }
    );
  } catch (error) {
    next(error);
  }
};
