import Manga from "../models/Manga";
import User from "../models/User";
import Comment from "../models/Comment";
import { AuthRequest } from "../middlewares/verifyJWT";
import { RequestHandler } from "express";

export const addCommentsToManga: RequestHandler = async (req, res, next) => {
  try {
    const newReq = req as unknown as AuthRequest;
    const userId = newReq.userId;

    const commenter = await User.findById(userId).exec();
    if (!commenter) {
      return res.status(404).json({ message: "User not found" });
    }

    const { mangaSlug } = req.params;
    const manga = await Manga.findOne({ slug: mangaSlug }).select("_id");
    if (!manga) {
      return res.status(404).json({ message: "Manga not found" });
    }

    const { body } = req.body;

    const newComment = await Comment.create({
      body: body,
      author: commenter._id,
      manga: manga._id,
    });
    await manga.addComment(newComment._id);
    return res.status(200).json({
      comment: await newComment.toCommentResponse(),
    });
  } catch (error) {
    next(error);
  }
};

export const getCommentsFromManga: RequestHandler = async (req, res, next) => {
  try {
    const { mangaSlug } = req.params;
    const manga = await Manga.findOne({ slug: mangaSlug }).exec();

    if (!manga) {
      return res.status(404).json({ message: "Manga not found" });
    }

    res.status(200).json({
      comments: await Promise.all(
        manga.comments.map(async (commentId) => {
          const commentObj = await Comment.findById(commentId);
          if (!commentObj) {
            return res.status(404).json({ message: "Comment not found" });
          }
          return await commentObj.toCommentResponse();
        })
      ),
    });
  } catch (error) {
    next(error);
  }
};
