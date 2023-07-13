import express, { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";
import connectDB from "./src/config/db";
import { catchInvalidJsonError } from "./src/middlewares/catchInvalidJsonError";
import createHttpError, { isHttpError } from "http-errors";
import userRoutes from "./src/routes/user";
import mangaRoutes from "./src/routes/manga";
import toolRoutes from "./src/routes/imageTool";
import commentRoutes from "./src/routes/comment";
import cors from "cors";
import morgan from "morgan";
import path from "path";

dotenv.config();
const app = express();

connectDB(process.env.MONGO_URI as string);

app.use(cors());
app.use(express.json());
// app.use(catchInvalidJsonError);
app.use(morgan("dev"));

app.use("/api", userRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/manga", mangaRoutes);
app.use("/api/tool", toolRoutes);

app.use("/public", express.static(path.join(__dirname, "public")));
app.get("/public/images/:imageName", (req, res) => {
  res.sendFile(
    path.join(__dirname, "src", "public", "images", req.params.imageName)
  );
});

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ message: errorMessage });
});

app.listen(process.env.PORT, () =>
  console.log("listening on port " + process.env.PORT)
);
