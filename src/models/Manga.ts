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
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

interface IMangaMethods {
  toMangaResponse(): Promise<ToMangaResponse>;
  addComment(commentId: Types.ObjectId): Promise<IManga>;
  removeComment(commentId: Types.ObjectId): Promise<IManga>;
}

interface ToMangaResponse {
  title: string;
  description: string;
  image: string;
  chapters: {
    slug: string;
    _id: Types.ObjectId;
    type: string;
    title: string;
  }[];
  tagList: string[];
  slug: string;
  uploader: string;
  createdAt: string;
  updatedAt: string;
  _id: string;
}

const mangaSchema = new Schema<IManga, MangaModel, IMangaMethods>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    image: String,
    chapters: [
      {
        type: Schema.Types.ObjectId,
        ref: "MangaChapter",
      },
    ],
    tagList: [String],
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
    comments: [
      {
        type: Types.ObjectId,
        ref: "Comment",
      },
    ],
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

mangaSchema.method(
  "toMangaResponse",
  async function toMangaResponse(this: IManga): Promise<ToMangaResponse> {
    try {
      const username: IUser | null = await User.findById(this.uploader)
        .lean()
        .exec();
      const chapters: IMangaChapter[] | null = await MangaChapter.find({
        _id: { $in: this.chapters },
      })
        .sort({ title: "desc" })
        .lean()
        .exec();

      const chapterTitles: {
        slug: string;
        _id: Types.ObjectId;
        type: string;
        title: string;
      }[] = chapters.map(({ slug, _id, type, title }) => ({
        slug,
        _id,
        type,
        title,
      }));

      return {
        title: this.title,
        description: this.description || "",
        image: this.image || "",
        chapters: chapterTitles,
        tagList: this.tagList || [],
        slug: this.slug,
        uploader: username?.username || "",
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString(),
        _id: this._id.toString(),
      };
    } catch (error: unknown) {
      throw new Error("Error in toMangaResponse: " + (error as Error).message);
    }
  }
);

mangaSchema.method(
  "addComment",
  async function addComment(commentId: Types.ObjectId): Promise<IManga> {
    if (this.comments.indexOf(commentId) === -1) { // ตรวจสอบว่า parameter ที่ส่งมามีใน array comments ไหม ถ้ามี return 0 ไม่มี return -1
      this.comments.push(commentId); // เมื่อตรวจสอบแล้วว่าไม่มี parameter ใน array ให้เพิ่ม parameter เข้า array
    }

    return this.save();
  }
);

mangaSchema.method(
  "removeComment",
  async function removeComment(commentId: Types.ObjectId): Promise<IManga> {
    if (this.comments.indexOf(commentId) !== -1) {
      this.comments.remove(commentId);
    }

    return this.save();
  }
);

type MangaModel = Model<IManga, object, IMangaMethods>;

const Manga = mongoose.model<IManga, MangaModel>("Manga", mangaSchema);
export default Manga;
