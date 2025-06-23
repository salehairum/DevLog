import React from "react";
import { useNavigate } from 'react-router-dom'
import { auth } from "../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import logo_main from "../logo_main.png"; 
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()  
    const BASE_URL = envConfig.VITE_BACKEND_API_BASE_URL
    
    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const user = result.user;
            const token = await user.getIdToken();

            // Send token to your backend
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

            // Context will already update user via onAuthStateChanged
            navigate('/dashboard');
        } catch (err) {
            console.error("Login error:", err);
            alert("Login failed. Check console.");
        }
    };


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background2 px-4">
            {/* Logo */}
            <img src={logo_main} alt="Devlog Logo" className="w-72 h-36 mb-4" />

            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                {/* Title */}
                <h1 className="text-3xl font-semibold mb-2">Login</h1>

                {/* Subtitle */}
                <p className="text-sm text-gray-600 mb-8 max-w-xs mx-auto">
                    Your personal hub to manage and track all your dev logs.
                </p>

                {/* Google Sign-in button */}
                <button
                    onClick={handleGoogleLogin}
                    className="bg-logs1 hover:bg-logs1/90 transition text-white px-6 py-2 rounded-lg shadow duration-300"
                >
                    Sign in with Google
                </button>
            </div>

        </div>
    );

}
