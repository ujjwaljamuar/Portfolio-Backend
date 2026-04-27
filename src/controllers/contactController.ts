import { Request, Response } from "express";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import firebase from "../configs/firebase.js";
import { sendEmailNotification } from "./emailController.js";
import { buildJsonResponse } from "../utils/response.js";

const db = getFirestore(firebase);

export const saveContactInfo = catchAsyncError(
  async (req: Request, res: Response, next) => {
    const { name, email, message } = req.body?.data || {};

    if (!name || !email || !message) {
      console.error("Error saving contact.");
      return next(new ErrorHandler("Missing fields", 400));
    }

    const docRef = await addDoc(collection(db, "contacts"), {
      name,
      email,
      message,
      createdAt: serverTimestamp(),
    });

    let emailSent = true;
    try {
      await sendEmailNotification({ name, email, message });
    } catch (error) {
      emailSent = false;
      console.error("Contact saved, but email notification failed:", error);
    }

    return res.json(
      buildJsonResponse({
        message: "Contact saved successfully",
        data: { id: docRef.id, emailSent },
      }),
    );
  },
);

export const getContactDataCSV = catchAsyncError(
  async (req: Request, res: Response, next) => {
    const contacts = collection(db, "contacts");
    const snapshot = await getDocs(contacts);
    let csvContent = "";

    snapshot.forEach((contactDoc) => {
      const data = contactDoc.data();
      const csvRow = Object.values(data).join(",");
      csvContent += `${csvRow}\r\n`;
    });

    return res.json(
      buildJsonResponse({
        message: "Contact CSV data fetched successfully",
        data: { csvData: csvContent },
      }),
    );
  },
);
