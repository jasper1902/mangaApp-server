import mongoose, { Document, Model } from "mongoose";

interface IMangaChapter extends Document {
  chapter: number;
  slug: string;
  images: string[];
}

type MangaChapterModel = Model<IMangaChapter, object>;

const MangaChapterSchema = new mongoose.Schema<
  IMangaChapter,
  MangaChapterModel
>(
  {
    chapter: {
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

const MangaChapter = mongoose.model<IMangaChapter, MangaChapterModel>(
  "MangaChapter",
  MangaChapterSchema
);
export default MangaChapter;
