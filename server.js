import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { Resend } from "resend";

const app = express();

app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

app.get("/", (req, res) => {
    res.json("Backend Server is running ...");
});

const resend = new Resend(process.env.RESEND_API);
app.post("/mailportfolio", async (req, res) => {
    try {
        await resend.emails.send({
            from: `${req.body.data.name} <onboarding@resend.dev>`,
            to: ["ujjwalj12222@gmail.com"],
            subject: "Contacted through Portfolio",
            html: `<strong>Name: ${req.body.data.name} <br><br>
            Email: ${req.body.data.email}<br><br>
            Message: ${req.body.data.message}  </strong>`,
        });

        console.log("Email sent");

        res.json({
            "success": true,
        });
    } catch (error) {
        res.send(error);
    }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () =>
    console.log(`server is running successfully on PORT: ${PORT}`)
);
