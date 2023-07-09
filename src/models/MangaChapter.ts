import mongoose, { Document, Model, Schema } from "mongoose";

interface IMangaChapter extends Document {
  book: number;
  slug: string;
  images: string[];
  title: string;
  author: Schema.Types.ObjectId;
  lastEditor: Schema.Types.ObjectId;
  type: "book" | "chapter" | "video";
}

type MangaChapterModel = Model<IMangaChapter>;

const MangaChapterSchema = new Schema<IMangaChapter, MangaChapterModel>(
  {
    type: {
      type: String,
      default: "book",
      enum: ["book", "chapter", "video"],
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
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

const MangaChapter = mongoose.model<IMangaChapter, MangaChapterModel>(
  "MangaChapter",
  MangaChapterSchema
);
export default MangaChapter;
