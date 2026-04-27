import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../configs/config.js";
import { publicKey } from "../configs/jwt.js";
import { JwtPayload } from "../types/auth.types.js";
import { buildJsonResponse } from "../utils/response.js";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const adminAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.[config.authCookieName];

  const token =
    typeof cookieToken === "string" && cookieToken
      ? cookieToken
      : getBearerToken(authHeader);

  if (!token) {
    return res.status(401).json(
      buildJsonResponse({
        success: false,
        message: "Authentication token is missing",
      }),
    );
  }

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as JwtPayload;

    req.user = decoded;

    if (decoded.role !== "admin") {
      return res.status(403).json(
        buildJsonResponse({
          success: false,
          message: "Forbidden",
        }),
      );
    }

    next();
  } catch (error) {
    return res.status(401).json(
      buildJsonResponse({
        success: false,
        message: "Invalid or expired token",
      }),
    );
  }
};

const getBearerToken = (authHeader?: string): string | undefined => {
  if (!authHeader) {
    return undefined;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return undefined;
  }

  return token;
};
