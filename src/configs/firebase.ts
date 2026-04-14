import { initializeApp, type FirebaseApp } from "firebase/app";
import config from "./config.js";

const firebase: FirebaseApp = initializeApp(config.firebaseConfig);

export default firebase;
