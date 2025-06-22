import React from "react";
import { auth } from "../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Login({ onLogin }) {
    const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;
    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const user = result.user;
            const token = await user.getIdToken(); // Firebase ID token
            console.log("Firebase ID Token:", token);

            // Send token to backend for verification
            const res = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to log in on backend");

            const data = await res.json();
            console.log("Login successful:", data);

            // Optional: store user info or token
            onLogin(data.user); // Lift state up if needed

        } catch (err) {
            console.error("Login error:", err);
            alert("Login failed. Check console.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <h1 className="text-3xl font-semibold mb-6">Devlog Login</h1>
            <button
                onClick={handleGoogleLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
            >
                Sign in with Google
            </button>
        </div>
    );
}
