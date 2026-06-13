import { v2 as cloudinary } from "cloudinary";
import config from "./config.js";

cloudinary.config({
  cloud_name: config.cloudinaryConfig.cloudName,
  api_key: config.cloudinaryConfig.apiKey,
  api_secret: config.cloudinaryConfig.apiSecret,
});

export default cloudinary;
