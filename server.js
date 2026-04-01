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
        const name = req.body.data.name;
        const email = req.body.data.email;
        const message = req.body.data.message;

        await resend.emails.send({
            from: `${name} <onboarding@resend.dev>`,
            to: ["ujjwalj12222@gmail.com"],
            subject: "Contacted through Portfolio",
            html: `<strong>Name: ${name} <br><br>
            Email: ${email}<br><br>
            Message: ${message}  </strong>`,
        });

        console.log(`Incoming -'${email}' \nEmail sent.`);

        res.json({
            success: true,
        });
    } catch (error) {
        res.send(error);
    }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () =>
    console.log(`server is running successfully on PORT: ${PORT}`),
);
