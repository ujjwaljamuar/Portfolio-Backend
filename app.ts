import express, { Request, Response } from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import ErrorMiddleware from "./src/middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";

import contactRoutes from "./src/routes/contactRoutes.js";

config({
    path: path.resolve(process.cwd(), ".env"),
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
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    }),
);

app.get("/", (req, res) =>
    res.send(
        `<h1>Site is Working. click <a href=${process.env.FRONTEND_URL}>here</a> to visit frontend.</h1>`,
    ),
);

app.use("/contacts", contactRoutes);

app.use(ErrorMiddleware);

export default app;
