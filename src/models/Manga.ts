import mongoose, { Schema, Document, Model, Types } from "mongoose";
import User, { IUser } from "./User";
import MangaChapter, { IMangaChapter } from "./MangaChapter";

interface IManga extends Document {
  title: string;
  description?: string;
  image?: string;
  chapters?: Types.ObjectId[];
  tagList?: string[];
  slug: string;
  uploader: Types.ObjectId;
  lastEditor: Types.ObjectId;
}

interface IMangaMethods {
  toMangaResponse(): Promise<ToMangaResponse>;
}

type MangaModel = Model<IManga, object, IMangaMethods>;

const mangaSchema = new mongoose.Schema<IManga, MangaModel, IMangaMethods>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    chapters: [
      {
        type: Schema.Types.ObjectId,
        ref: "MangaChapter",
      },
    ],
    tagList: [
      {
        type: String,
      },
    ],
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastEditor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

interface ToMangaResponse {
  title: string;
  description: string;
  image: string;
  chapters: string[];
  tagList: string[];
  slug: string;
  uploader: string;
  createdAt: string;
  updatedAt: string;
  _id: string;
}
mangaSchema.method("toMangaResponse", async function toMangaResponse() {
  try {
    const username: IUser | null = await User.findById(this.uploader);
    const chapters: IMangaChapter[] | null = await MangaChapter.find({
      _id: { $in: this.chapters },
    });

    const populatedChapters: IMangaChapter[] = await MangaChapter.populate(
      chapters,
      {
        path: "chapters",
      }
    );

    const chapterTitles: {
      slug: string;
      _id: Types.ObjectId;
      type: string;
      title: string;
    }[] = populatedChapters.map((chapter) => ({
      slug: chapter.slug,
      _id: chapter._id,
      type: chapter.type,
      title: chapter.title,
    }));

    return {
      title: this.title,
      description: this.description,
      image: this.image,
      chapters: chapterTitles,
      tagList: this.tagList || [],
      slug: this.slug,
      uploader: username?.username || "",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _id: this._id,
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error("Error in toMangaResponse: " + error.message);
  }
});

const Manga = mongoose.model<IManga, MangaModel>("Manga", mangaSchema);
export default Manga;
