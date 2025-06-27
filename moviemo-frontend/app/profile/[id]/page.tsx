"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiService } from "@/app/services/api";
import Swal from "sweetalert2"; // Added SweetAlert import

// Placeholder icons (replace with your icon library, e.g., react-icons)
const UserIcon = () => <span className="h-5 w-5 text-gray-400">👤</span>;
const EditIcon = () => <span className="h-5 w-5 text-gray-400">✏️</span>;

export interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
}

// Translation map for field labels and prompts
const fieldTranslations: Record<keyof User, string> = {
  id: "ID",
  name: "Name",
  surname: "Surname",
  username: "Username",
  email: "Email",
};

// Map frontend field names to backend DTO property names
const dtoFieldMap: Record<keyof User, string> = {
  id: "Id",
  name: "Name",
  surname: "Surname",
  username: "Username",
  email: "Email",
};

export default function ProfilePage() {
  const { id } = useParams();
  const usersApiUrl = "https://localhost:7179/api/users";
  const [userData, setUserData] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${usersApiUrl}/${id}`, {
          headers: apiService.getHeaders(true),
        });
        if (!response.ok) throw new Error("Failed to fetch current user data");
        const data: User = await response.json();
        setCurrentUser(data);
      } catch (err) {
        setError(
          "Failed to fetch current user data: " + (err as Error).message
        );
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch user data
  useEffect(() => {
    if (!id) return;
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${usersApiUrl}/${id}`, {
          headers: apiService.getHeaders(true),
        });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data: User = await response.json();
        setUserData(data);
      } catch (err) {
        setError("Failed to fetch user data: " + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [id]);

  // Handle field update with SweetAlert
  const handleEdit = async (field: keyof User) => {
    if (!userData) return;

    const { value: newValue } = await Swal.fire({
      title: `Edit ${fieldTranslations[field]}`,
      input: "text",
      inputLabel: `New ${fieldTranslations[field]}:`,
      inputValue: getDisplayValue(field, userData[field]),
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value.trim()) {
          return "Please enter a valid value";
        }
      },
    });

    if (newValue === undefined || newValue.trim() === "") return; // Cancelled or empty

    setIsLoading(true);
    try {
      const response = await fetch(`${usersApiUrl}/${id}`, {
        method: "PUT",
        headers: apiService.getHeaders(true),
        body: JSON.stringify({ [dtoFieldMap[field]]: newValue.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user data");
      }

      setUserData((prev) =>
        prev ? { ...prev, [field]: newValue.trim() } : prev
      );

      // Show success notification
      Swal.fire({
        icon: "success",
        title: "Update Successful!",
        text: `${fieldTranslations[field]} has been updated`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      // Show error notification
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Define fields to display
  const fields: (keyof User)[] = ["name", "surname", "username", "email"];

  // Convert userRole enum to string for display
  const getDisplayValue = (field: keyof User, value: any): string => {
    return String(value || "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            User Profile
          </h2>
          <p className="text-gray-300">View and edit profile information</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : userData ? (
            <div className="space-y-6">
              {fields.map((field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    {fieldTranslations[field]}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon />
                    </div>
                    <input
                      id={field}
                      name={field}
                      type="text"
                      disabled
                      value={getDisplayValue(field, userData[field])}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                    {currentUser?.username ==
                      localStorage.getItem("username") && (
                      <button
                        type="button"
                        onClick={() => handleEdit(field)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                        disabled={isLoading}
                      >
                        <EditIcon />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-center">User data not found</p>
          )}

          {/* Password Change Button */}
          {currentUser?.username == localStorage.getItem("username") && (
            <div className="mt-6">
              <Link
                href={`/profile/${id}/change-password`}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                Change Password
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-300">
              Go back to{" "}
              <Link
                href="/"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Home
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">Designed for movie lovers ❤️</p>
        </div>
      </div>
    </div>
  );
}
