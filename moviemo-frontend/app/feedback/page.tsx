"use client";

import FeedbackForm from "./../components/FeedbackForm";

export default function FeedbackPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-rose-200 py-16 px-4 flex flex-col items-center transition-colors duration-500">
            <div className="max-w-3xl w-full text-center mb-12 animate-fadeInUp">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">
                    We’d Love to Hear from You!
                </h1>
                <p className="mt-4 text-lg text-gray-800">
                    Got a suggestion, issue, or just want to say hi? Let us know what you
                    think about <span className="font-semibold text-purple-700">Moviemo</span>.
                </p>
            </div>

            <div className="w-full max-w-xl animate-fadeInUp">
                <FeedbackForm />
            </div>

            {/* Smooth entry animation */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.7s ease-out both;
                }
            `}</style>
        </div>
    );
}
