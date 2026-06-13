import { Request, Response } from "express";
import cloudinary from "../configs/cloudinary.js";
import streamifier from "streamifier";

type CloudinaryImage = {
  originalUrl: string;
  deliveryUrl: string;
  publicId: string;
};

export const uploadImage = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const image = await uploadImageToCloudinary(
      req.file.buffer,
      "portfolio/blogs",
    );

    return res.status(200).json({
      success: true,
      url: image.deliveryUrl,
      originalUrl: image.originalUrl,
      publicId: image.publicId,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};

export const uploadImageToCloudinary = (
  buffer: Buffer,
  folder: string = "portfolio",
): Promise<CloudinaryImage> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Upload failed"));
          return;
        }

        const deliveryUrl = cloudinary.url(result.public_id, {
          secure: true,
          width: 1600,
          height: 900,
          crop: "fill",
          quality: "auto",
          fetch_format: "auto",
        });

        resolve({
          originalUrl: result.secure_url,
          deliveryUrl,
          publicId: result.public_id,
        });
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
