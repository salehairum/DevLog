import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCzbM-XhK4kRGOylTRa3Ol8MQJws3g-2Mk",
    authDomain: "devlog-1dae6.firebaseapp.com",
    projectId: "devlog-1dae6",
    storageBucket: "devlog-1dae6.firebasestorage.app",
    messagingSenderId: "685065962583",
    appId: "1:685065962583:web:44250c2b97e13b57cb8f12"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);