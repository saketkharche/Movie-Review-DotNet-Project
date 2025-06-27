"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiService } from "@/app/services/api";
import Swal from "sweetalert2";

export default function ChangePasswordPage() {
  const { id } = useParams();
  const usersApiUrl = "https://localhost:7179/api/users";
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle password change with SweetAlert
  const handleChangePassword = async () => {
    // Validate inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "All fields are required.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${usersApiUrl}/${id}/change-password`, {
        method: "PUT",
        headers: apiService.getHeaders(true),
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Password change failed.");
      }

      // Clear form fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Show success notification
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Password changed successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      // Logout and redirect
      apiService.logout();
      window.location.href = "/login";
    } catch (err) {
      // Show error notification
      Swal.fire({
        icon: "error",
        title: "Error",
        text: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center m-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Change Password
          </h2>
          <p className="text-gray-300">Set your new password below</p>
        </div>

        {/* Password Change Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="space-y-6">
            {/* Old Password */}
            <div>
              <label
                htmlFor="oldPassword"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Current Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="block w-full pl-10 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your current password"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your new password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Re-enter your new password"
                />
              </div>
            </div>

            {/* Change Button */}
            <button
              type="button"
              onClick={handleChangePassword}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Change Password"
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-300">
              Go back to{" "}
              <Link
                href={`/profile/${id}`}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Profile
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="m-8 text-center">
          <p className="text-gray-400 text-sm">Designed for movie lovers ❤️</p>
        </div>
      </div>
    </div>
  );
}
