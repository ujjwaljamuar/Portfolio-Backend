import { Request, Response } from "express";
import { Resend } from "resend";

import config from "../configs/config.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { buildJsonResponse } from "../utils/response.js";

type ContactEmailPayload = {
  name: string;
  email: string;
  message: string;
};

export const sendEmailNotification = async ({
  name,
  email,
  message,
}: ContactEmailPayload): Promise<void> => {
  const resend = new Resend(config.resendApiKey);

  await resend.emails.send({
    from: `${name} <onboarding@resend.dev>`,
    to: ["ujjwalj12222@gmail.com"],
    subject: "Contacted through Portfolio",
    html: `<strong>Name: ${name} <br><br>
            Email: ${email}<br><br>
            Message: ${message}  </strong>`,
  });

  console.log(`Incoming - '${email}' \nEmail sent.`);
};

// Optional HTTP wrapper in case this route is used externally.
export const sendEmailNotificationHandler = catchAsyncError(
  async (req: Request, res: Response) => {
    const { name, email, message } = req.body?.data || {};

    await sendEmailNotification({ name, email, message });

    return res.json(
      buildJsonResponse({
        message: "Email notification sent successfully",
      }),
    );
  },
);
