import mongoose, { Document, Model } from "mongoose";

interface IMangaEpisode extends Document {
  episode: number;
  slug: string;
  images: string[];
}

type MangaEpisodeModel = Model<IMangaEpisode, object>;

const MangaEpisodeSchema = new mongoose.Schema<
  IMangaEpisode,
  MangaEpisodeModel
>(
  {
    episode: {
      type: Number,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      require: true,
      unique: true,
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

const MangaEpisode = mongoose.model<IMangaEpisode, MangaEpisodeModel>(
  "MangaEpisode",
  MangaEpisodeSchema
);
export default MangaEpisode;
