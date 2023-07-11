import mongoose, { Schema, Document, Model, Types } from "mongoose";
import User, { IUser } from "./User";

interface IComment {
  body: string;
  author: Types.ObjectId;
  manga: Types.ObjectId;
}

interface ICommentMethods {
  toCommentResponse(user: IUser | null | undefined): Promise<ToCommentResponse | undefined>;
}

interface CommentDocument extends Document, IComment, ICommentMethods {
  createdAt: Date;
  updatedAt: Date;
  // Add any additional fields specific to the Comment model
}

interface ToCommentResponse {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    username: string;
    image: string;
  };
}

const CommentSchema = new Schema<CommentDocument, CommentModel, ICommentMethods>(
  {
    body: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    manga: {
      type: Schema.Types.ObjectId,
      ref: "Manga",
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.method(
  "toCommentResponse",
  async function toCommentResponse(user: IUser | null | undefined): Promise<ToCommentResponse | undefined> {
    const comment = this as Document & CommentDocument;
    const author = await User.findById(comment.author).lean().exec();

    return author
      ? {
          id: comment._id,
          body: comment.body,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          author: {
            username: user?.username ?? "",
            image: author.image,
          },
        }
      : undefined;
  }
);

type CommentModel = Model<CommentDocument>;

export default mongoose.model<CommentDocument, CommentModel>("Comment", CommentSchema);
