import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const {
  NODE_ENV,
  PORT,
  MONGODB_URI,
  FRONTEND_URL,
  ADMIN_SETUP_KEY,
  RESEND_API,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} = process.env;

const requiredEnvVars = [
  "MONGODB_URI",
  "FRONTEND_URL",
  "ADMIN_SETUP_KEY",
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
] as const;

for (const envKey of requiredEnvVars) {
  if (!process.env[envKey]) {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }
}

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

type AppConfig = {
  nodeEnv: string;
  isProduction: boolean;
  port: number;
  mongoUri: string;
  frontendUrl: string;
  adminSetupKey: string;
  authCookieName: string;
  resendApiKey?: string;
  firebaseConfig: FirebaseConfig;
};

const config: AppConfig = {
  nodeEnv: NODE_ENV || "development",
  isProduction: NODE_ENV === "production",
  port: Number(PORT) || 8080,
  mongoUri: MONGODB_URI!,
  frontendUrl: FRONTEND_URL!,
  adminSetupKey: ADMIN_SETUP_KEY!,
  authCookieName: "portfolio_admin_token",
  resendApiKey: RESEND_API,
  firebaseConfig: {
    apiKey: FIREBASE_API_KEY!,
    authDomain: FIREBASE_AUTH_DOMAIN!,
    projectId: FIREBASE_PROJECT_ID!,
    storageBucket: FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID!,
    appId: FIREBASE_APP_ID!,
  },
};

export default config;
