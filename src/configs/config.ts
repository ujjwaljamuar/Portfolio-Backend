import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
});

const {
    RESEND_API,
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
} = process.env;

const requiredFirebaseVars = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
    "FIREBASE_MESSAGING_SENDER_ID",
    "FIREBASE_APP_ID",
] as const;

for (const envKey of requiredFirebaseVars) {
    if (!process.env[envKey]) {
        throw new Error(`Missing required environment variable: ${envKey}`);
    }
}

type FirebaseConfig = {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
};

type AppConfig = {
    resendApiKey?: string;
    firebaseConfig: FirebaseConfig;
};

const config: AppConfig = {
    resendApiKey: RESEND_API,
    firebaseConfig: {
        apiKey: FIREBASE_API_KEY,
        authDomain: FIREBASE_AUTH_DOMAIN,
        projectId: FIREBASE_PROJECT_ID,
        storageBucket: FIREBASE_STORAGE_BUCKET,
        messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
        appId: FIREBASE_APP_ID,
    },
};

export default config;
