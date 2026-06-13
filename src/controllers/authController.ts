import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

import config from "../configs/config.js";
import { privateKey } from "../configs/jwt.js";
import AdminModel from "../models/adminModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { buildJsonResponse } from "../utils/response.js";

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const adminLogin = catchAsyncError(
  async (req: Request, res: Response, next) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return next(new ErrorHandler("Email and password are required", 400));
    }

    const admin = await AdminModel.findOne({
      email: String(email).toLowerCase(),
    }).select("+password");
    const isMatch = admin
      ? await bcrypt.compare(String(password), admin.password)
      : false;

    if (!admin || !isMatch) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    const token = jwt.sign({ role: "admin", id: admin._id }, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });

    res.cookie(config.authCookieName, token, authCookieOptions);

    return res.json(
      buildJsonResponse({
        message: "Login successful",
      }),
    );
  },
);

export const adminLogout = catchAsyncError(
  async (req: Request, res: Response) => {
    res.clearCookie(config.authCookieName, {
      httpOnly: authCookieOptions.httpOnly,
      secure: authCookieOptions.secure,
      sameSite: authCookieOptions.sameSite,
      path: authCookieOptions.path,
    });

    return res.json(
      buildJsonResponse({
        message: "Logout successful",
      }),
    );
  },
);

export const createAdmin = catchAsyncError(
  async (req: Request, res: Response, next): Promise<Response | void> => {
    const setupKey = req.headers["x-admin-setup-key"];
    if (setupKey !== config.adminSetupKey) {
      return next(new ErrorHandler("Unauthorized admin setup attempt", 401));
    }

    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return next(new ErrorHandler("Email and password are required", 400));
    }

    const normalizedEmail = String(email).toLowerCase();
    const existingAdmin = await AdminModel.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return next(new ErrorHandler("Admin already exists for this email", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await AdminModel.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json(
      buildJsonResponse({
        message: "Admin created successfully",
      }),
    );
  },
);

export const forgotPassword = catchAsyncError(
  async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    if (!email) {
      return res.status(400).json(
        buildJsonResponse({
          success: false,
          message: "Email is required",
        }),
      );
    }

    const admin = await AdminModel.findOne({
      email: String(email).toLowerCase(),
    });
    if (!admin) {
      return res.json(
        buildJsonResponse({
          message: "If the account exists, a reset link has been sent",
        }),
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    admin.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    admin.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await admin.save();

    // TODO: send reset token via email provider with your frontend reset URL.
    return res.json(
      buildJsonResponse({
        message: "If the account exists, a reset link has been sent",
      }),
    );
  },
);

export const resetPassword = catchAsyncError(
  async (req: Request, res: Response, next) => {
    const { token, newPassword } = req.body ?? {};
    if (!token || !newPassword) {
      return next(new ErrorHandler("Token and newPassword are required", 400));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await AdminModel.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!admin) {
      return next(new ErrorHandler("Invalid or expired token", 400));
    }

    admin.password = await bcrypt.hash(String(newPassword), 12);
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;

    await admin.save();

    return res.json(
      buildJsonResponse({
        message: "Password updated successfully",
      }),
    );
  },
);
