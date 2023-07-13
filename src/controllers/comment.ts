import Manga from "../models/Manga";
import User from "../models/User";
import Comment from "../models/Comment";
import { AuthRequest } from "../middlewares/verifyJWT";
import { NextFunction, RequestHandler, Request, Response } from "express";
import mongoose from "mongoose";

export const addCommentsToManga: RequestHandler = async (
  request: Request,
  response: Response,
  nextFunction: NextFunction
) => {
  try {
    const newReq = request as unknown as AuthRequest;
    const userId = newReq.userId;

    const commenter = await User.findById(userId).exec();
    if (!commenter) {
      return response.status(404).json({ message: "Commenter not found" });
    }

    const { mangaSlug } = request.params;
    const manga = await Manga.findOne({ slug: mangaSlug })
      .select("comments")
      .exec();
    if (!manga) {
      return response.status(404).json({ message: "Manga not found" });
    }

    const { body } = request.body.comments;

    const newComment = await Comment.create({
      body: body,
      author: commenter._id,
      manga: manga._id,
    });
    await manga.addComment(newComment._id);
    return response.status(200).json({
      comments: await newComment.toCommentResponse(),
      message: "Comment added successfully",
    });
  } catch (error) {
    nextFunction(error);
  }
};

export const getCommentsFromManga: RequestHandler = async (
  request: Request,
  response: Response,
  nextFunction: NextFunction
) => {
  try {
    const { mangaSlug } = request.params;
    const manga = await Manga.findOne({ slug: mangaSlug }).exec();

    if (!manga) {
      return response.status(404).json({ message: "Manga not found" });
    }

    const comments = [];
    for (const commentId of manga.comments) {
      const commentObj = await Comment.findById(commentId).exec();
      if (commentObj) {
        comments.push(await commentObj.toCommentResponse());
      }
    }

    comments.sort((a, b) =>
      b && a && b.createdAt && a.createdAt
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : 0
    );

    response.status(200).json({
      comments,
    });
  } catch (error) {
    nextFunction(error);
  }
};

export const deleteCommentFromManga: RequestHandler = async (
  request: Request,
  response: Response,
  nextFunction: NextFunction
) => {
  try {
    const { userId } = request as unknown as AuthRequest;
    const { mangaSlug, commentId } = request.params;

    const [commenter, manga, comment] = await Promise.all([
      User.findById(userId).exec(),
      Manga.findOne({ slug: mangaSlug }).select("comments").exec(),
      Comment.findById(commentId).exec(),
    ]);

    if (!commenter) {
      return response.status(404).json({ message: "User not found" });
    }

    if (!manga) {
      return response.status(404).json({ message: "Manga not found" });
    }

    if (!comment) {
      return response.status(404).json({ message: "Comment not found" });
    }

    if (comment.author._id.toString() === commenter._id.toString()) {
      await Promise.all([
        manga.removeComment(new mongoose.Types.ObjectId(commentId)),
        Comment.deleteOne({ _id: commentId }),
      ]);
      const comments = await Promise.all(
        manga.comments.map(async (commentId) => {
          const commentObj = await Comment.findById(commentId).exec();
          if (!commentObj) {
            return null;
          }
          return await commentObj.toCommentResponse();
        })
      );

      const validComments = comments.filter((comment) => comment !== null);
      validComments.sort((a, b) =>
        b && a && b.createdAt && a.createdAt
          ? b.createdAt.getTime() - a.createdAt.getTime()
          : 0
      );
      return response.status(200).json({
        message: "Comment has been successfully deleted!!!",
        comments: validComments,
      });
    } else {
      return response.status(403).json({
        message: "Only the author of the comment can delete the comment",
      });
    }
  } catch (error) {
    nextFunction(error);
  }
};
