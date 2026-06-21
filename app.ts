import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import ErrorMiddleware from "./src/middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./src/configs/config.js";
import connectDB from "./src/configs/db.js";

import contactRoutes from "./src/routes/contactRoutes.js";
import blogRoutes from "./src/routes/blogRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import dsaRoutes from "./src/routes/dsaRoutes.js";

connectDB().catch((error) => {
  console.error("MongoDB connection failed:", error);
});

const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next) => {
  res.setHeader(
    "Cache-Control",
    "no-cache, no-store, max-age=0, must-revalidate",
  );
  next();
});
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
  }),
);

app.use(cookieParser());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.get("/", (req, res) =>
  res.send(
    `<h1>Site is Working. click <a href=${config.frontendUrl}>here</a> to visit frontend.</h1>`,
  ),
);

app.use("/contacts", contactRoutes);
app.use("/auth", authRoutes);

app.use("/blogs", blogRoutes);
app.use("/api/admin/dsa", dsaRoutes);

app.use(ErrorMiddleware);

export default app;
