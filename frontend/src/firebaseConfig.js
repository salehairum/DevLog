import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import envConfig from './env-config';

const firebaseConfig = {
    apiKey: envConfig.VITE_FIREBASE_API_KEY,
    authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
    storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: envConfig.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);