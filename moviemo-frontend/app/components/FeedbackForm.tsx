"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface FeedbackData {
    name: string;
    email: string;
    message: string;
}

export default function FeedbackForm() {
    const [formData, setFormData] = useState<FeedbackData>({
        name: "",
        email: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post(
                "https://localhost:7179/api/FeedbackApi",
                formData
            );
            if (response.status === 200) {
                MySwal.fire({
                    icon: "success",
                    title: "🎉 Feedback Sent!",
                    text: "We appreciate your feedback 😊",
                    toast: true,
                    timer: 3000,
                    showConfirmButton: false,
                    position: "top-end",
                });
                setFormData({ name: "", email: "", message: "" });
            }
        } catch (error) {
            console.error("Error:", error);
            MySwal.fire({
                icon: "error",
                title: "⚠️ Submission Failed",
                text: "Please check your network and try again.",
                toast: true,
                timer: 3000,
                showConfirmButton: false,
                position: "top-end",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-rose-100 transition-colors duration-500">
            <div className="w-full max-w-lg p-8 sm:p-10 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl transition hover:scale-[1.01]">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    💌 Share Your Feedback
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        required
                        className="w-full px-5 py-3 rounded-xl text-gray-700 placeholder-gray-500 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="w-full px-5 py-3 rounded-xl text-gray-700 placeholder-gray-500 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />

                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Write your feedback here..."
                        rows={5}
                        required
                        className="w-full px-5 py-3 rounded-xl text-gray-700 placeholder-gray-500 bg-white border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-xl font-bold text-lg transition-all bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:brightness-105 hover:shadow-md active:scale-95 ${
                            isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                    >
                        {isSubmitting ? "Submitting..." : "🚀 Send Feedback"}
                    </button>
                </form>
            </div>
        </div>
    );
}
