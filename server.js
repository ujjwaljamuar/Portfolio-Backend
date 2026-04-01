import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Resend } from "resend";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";

import firebase from "./src/config/firebase.js";

const db = getFirestore(firebase);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/contacts", async (req, res) => {
    try {
        const { name, email, message } = req.body?.data || {};

        if (!name || !email || !message) {
            return res
                .status(400)
                .json({ success: false, error: "Missing fields" });
        }

        const docRef = await addDoc(collection(db, "contacts"), {
            name,
            email,
            message,
            createdAt: serverTimestamp(),
        });

        return res.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error("Error saving contact:", error);
        return res
            .status(500)
            .json({ success: false, error: "Failed to save contact" });
    }
});

app.get("/contacts/csv", async (req, res) => {
    try {
        const contacts = collection(db, "contacts");
        const snapshot = await getDocs(contacts);
        let csvContent = "";

        snapshot.forEach((contactDoc) => {
            const data = contactDoc.data();
            const csvRow = Object.values(data).join(",");
            csvContent += `${csvRow}\r\n`;
        });

        return res.json({ success: true, csvData: csvContent });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return res
            .status(500)
            .json({ success: false, error: "Failed to fetch contacts" });
    }
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

app.get("/", (req, res) => {
    res.json("Backend Server is running ...");
});

app.listen(PORT, () =>
    console.log(`server is running successfully on PORT: ${PORT}`),
);
