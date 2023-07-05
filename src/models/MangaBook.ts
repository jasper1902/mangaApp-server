import mongoose, { Document, Model } from "mongoose";

interface IMangaBook extends Document {
  book: number;
  slug: string;
  images: string[];
}

type MangaBookModel = Model<IMangaBook, object>;

const MangaBookSchema = new mongoose.Schema<IMangaBook, MangaBookModel>(
  {
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
  },
  { timestamps: true }
);

const MangaBook = mongoose.model<IMangaBook, MangaBookModel>(
  "MangaBook",
  MangaBookSchema
);
export default MangaBook;
