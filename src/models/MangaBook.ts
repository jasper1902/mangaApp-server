import mongoose, { Document, Model, Schema } from "mongoose";

interface IMangaBook extends Document {
  book: number;
  slug: string;
  images: string[];
  title: string;
  author: Schema.Types.ObjectId;
}

type MangaBookModel = Model<IMangaBook, object>;

const MangaBookSchema = new mongoose.Schema<IMangaBook, MangaBookModel>(
  {
    title: {
      type: String,
      require: true,
    },
    book: {
      type: Number,
      required: true,
    },
    slug: {
      type: String,
      require: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const MangaBook = mongoose.model<IMangaBook, MangaBookModel>(
  "MangaBook",
  MangaBookSchema
);
export default MangaBook;
