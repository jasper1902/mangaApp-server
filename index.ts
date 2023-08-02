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
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express"

dotenv.config();
const app = express();

connectDB(process.env.MONGO_URI as string);

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API for Manga App',
    version: '1.0.0',
    description:
      'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
    license: {
      name: 'Licensed Under MIT',
      url: 'https://spdx.org/licenses/MIT.html',
    },
    // contact: {
    //   name: 'JSONPlaceholder',
    //   url: 'https://jsonplaceholder.typicode.com',
    // },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/routes/*.ts '],
};

const swaggerSpec = swaggerJSDoc(options);

app.use(cors());
app.use(express.json());
app.use(catchInvalidJsonError);
app.use(morgan("dev"));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/account", userRoutes);
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
