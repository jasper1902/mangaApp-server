import mongoose, { Schema, Document, Model } from "mongoose";

interface IManga extends Document {
  title: string;
  description?: string;
  image?: string;
  episode?: Schema.Types.ObjectId[];
  book?: Schema.Types.ObjectId[];
  tagList?: string[];
  slug: string;
  uploader: Schema.Types.ObjectId;
}

type MangaModel = Model<IManga, object>;

const mangaSchema = new mongoose.Schema<IManga, MangaModel>(
  {
    title: {
      type: String,
      require: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    episode: [
      {
        type: Schema.Types.ObjectId,
        ref: "MangaEpisode",
      },
    ],
    book: [
      {
        type: Schema.Types.ObjectId,
        ref: "MangaBook",
      },
    ],
    tagList: [
      {
        type: String,
      },
    ],
    slug: {
      type: String,
      require: true,
      unique: true,
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Manga = mongoose.model<IManga, MangaModel>("Manga", mangaSchema);
export default Manga;
