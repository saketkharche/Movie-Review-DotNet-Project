"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { apiService } from "../services/api";
import { Movie, MovieCreateDto } from "../types/movie";
import { Report } from "../types/report";
import { getCurrentUserId, getCurrentUserRole } from "../utils/user";

const MySwal = withReactContent(Swal);

interface User {
  id: number;
  username: string;
  userRole: number;
}

const AdminPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("homepage");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState<boolean>(false);
  const moviesApiUrl = "https://localhost:7179/api/movies";
  const usersApiUrl = "https://localhost:7179/api/users";
  const reportsApiUrl = "https://localhost:7179/api/reports";
  const feedbackApiUrl = "https://localhost:7179/api/FeedbackApi";
  // Movie states
  const [addMovieFormData, setAddMovieFormData] = useState<MovieCreateDto>({
    title: "",
    overview: "",
    trailerUrl: "",
    posterPath: "",
  });
  const [movieSearchQuery, setMovieSearchQuery] = useState<string>("");
  const [movieSearchResults, setMovieSearchResults] = useState<Movie[]>([]);
  const [movieSearchLoading, setMovieSearchLoading] = useState<boolean>(false);

  // Edit movie states
  const [editMovieSearchQuery, setEditMovieSearchQuery] = useState<string>("");
  const [editMovieSearchResults, setEditMovieSearchResults] = useState<Movie[]>(
      []
  );
  const [editMovieSearchLoading, setEditMovieSearchLoading] =
      useState<boolean>(false);
  const [selectedMovieForEdit, setSelectedMovieForEdit] =
      useState<Movie | null>(null);
  const [editMovieFormData, setEditMovieFormData] = useState<MovieCreateDto>({
    title: "",
    overview: "",
    trailerUrl: "",
    posterPath: "",
  });
  const [originalMovieData, setOriginalMovieData] = useState<MovieCreateDto>({
    title: "",
    overview: "",
    trailerUrl: "",
    posterPath: "",
  });

  // User states
  const [userRole, setUserRole] = useState<string>("1");
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [userSearchResult, setUserSearchResult] = useState<User | null>(null);
  const [userSearchLoading, setUserSearchLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<number>(0);

  const roleMap: { [key: number]: string } = {
    0: "Basic",
    1: "Admin",
    2: "Manager",
  };

  // Feedback States - UPDATED
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAndSetUserRole = async () => {
      try {
        const role = await getCurrentUserRole();
        setUserRole(String(role));
      } catch (error) {
        console.error("Error fetching user role:", error);
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch user role",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#6366f1",
        });
      }
    };
    getAndSetUserRole();
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (activeSection === "reports" && (userRole === "1" || userRole === "2")) {
      const fetchReports = async () => {
        setReportsLoading(true);
        try {
          const response = await fetch(reportsApiUrl, {
            method: "GET",
            headers: apiService.getHeaders(true),
          });
          if (response.ok) {
            setReports(await response.json());
          } else {
            MySwal.fire({
              icon: "error",
              title: "Failed",
              text: "Failed to load reports!",
              background: "#1f2937",
              color: "#fff",
              confirmButtonColor: "#6366f1",
            });
          }
        } catch (error) {
          console.error("Error fetching reports:", error);
          MySwal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load reports!",
            background: "#1f2937",
            color: "#fff",
            confirmButtonColor: "#6366f1",
          });
        } finally {
          setReportsLoading(false);
        }
      };
      fetchReports();
    }
  }, [activeSection, userRole, reportsApiUrl]);

  const showSection = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false);

    if (section !== "remove-movie") {
      setMovieSearchQuery("");
      setMovieSearchResults([]);
    }
    if (section !== "feedback") {
      setFeedbacks([]);
    }
    if (section !== "edit-movie") {
      setEditMovieSearchQuery("");
      setEditMovieSearchResults([]);
      setSelectedMovieForEdit(null);
      setEditMovieFormData({
        title: "",
        overview: "",
        trailerUrl: "",
        posterPath: "",
      });
      setOriginalMovieData({
        title: "",
        overview: "",
        trailerUrl: "",
        posterPath: "",
      });
    }

    if (section !== "roles") {
      setUserSearchQuery("");
      setUserSearchResult(null);
      setSelectedRole(0);
    }
  };

  useEffect(() => {
    if (activeSection === "feedback" && (userRole === "1" || userRole === "2")) {
      fetchFeedbacks();
    }
  }, [activeSection, userRole]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddMovieInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAddMovieFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // UPDATED: Simplified feedback fetching
  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    try {
      const response = await fetch(feedbackApiUrl, {
        method: "GET",
        headers: apiService.getHeaders(true),
      });
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      } else {
        throw new Error("Failed to fetch feedback");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load feedback!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setFeedbackLoading(false);
    }
  };

  // UPDATED: Remove page parameter
  const deleteFeedback = async (id: number) => {
    const result = await MySwal.fire({
      icon: "warning",
      title: "Delete Feedback",
      text: "Are you sure you want to delete this feedback?",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "#1f2937",
      color: "#fff",
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${feedbackApiUrl}/${id}`, {
          method: "DELETE",
          headers: apiService.getHeaders(true),
        });
        if (response.ok) {
          fetchFeedbacks(); // Refresh without page parameter
          MySwal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Feedback deleted successfully.",
            background: "#1f2937",
            color: "#fff",
            confirmButtonColor: "#6366f1",
          });
        }
      } catch (error) {
        console.error("Error deleting feedback:", error);
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete feedback!",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#6366f1",
        });
      }
    }
  };

  const handleAddMovie = async () => {
    if (!addMovieFormData.title || !addMovieFormData.overview) {
      MySwal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please fill in the title and overview fields!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    try {
      const result = await MySwal.fire({
        title: "Are you sure?",
        text: "You are about to add a new movie",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#6b7280",
        background: "#1f2937",
        color: "#fff",
        confirmButtonText: "Yes, add it!",
      });

      if (!result.isConfirmed) return;

      const response = await fetch(moviesApiUrl, {
        method: "POST",
        headers: apiService.getHeaders(true),
        body: JSON.stringify(addMovieFormData),
      });

      if (response.ok) {
        const responseData = await response.json();

        await MySwal.fire({
          icon: "success",
          title: "Success!",
          text: "Movie successfully added!",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#6366f1",
        });

        setAddMovieFormData({
          title: "",
          overview: "",
          trailerUrl: "",
          posterPath: "",
        });

        const adminUsername =
            localStorage.getItem("username") || "Unknown Admin";
        const now = new Date().toLocaleString();
        const reportResponse = await fetch(reportsApiUrl, {
          method: "POST",
          headers: apiService.getHeaders(true),
          body: JSON.stringify({
            title: "CREATION: MOVIE",
            details: `${adminUsername} created the movie ${responseData.title} at ${now}`,
          }),
        });

        if (reportResponse.ok) {
          MySwal.fire({
            icon: "success",
            title: "Report Sent",
            text: "Report successfully sent to manager.",
            background: "#1f2937",
            color: "#fff",
            confirmButtonColor: "#6366f1",
          });
        }
      } else {
        throw new Error("Failed to add movie");
      }
    } catch (error) {
      console.error("Error adding movie:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add movie!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const searchMovies = async () => {
    if (!movieSearchQuery.trim()) return;
    setMovieSearchLoading(true);
    try {
      const response = await fetch(
          `${moviesApiUrl}/search?query=${encodeURIComponent(movieSearchQuery)}`
      );
      if (response.ok) {
        setMovieSearchResults(await response.json());
      } else {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Error during movie search!",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#6366f1",
        });
      }
    } catch (error) {
      console.error("Error searching movies:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Error during movie search!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setMovieSearchLoading(false);
    }
  };

  const deleteMovie = async (movieId: number) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#6b7280",
      background: "#1f2937",
      color: "#fff",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${moviesApiUrl}/${movieId}`, {
        method: "DELETE",
        headers: apiService.getHeaders(true),
      });

      if (response.ok) {
        await MySwal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Movie successfully deleted!",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#6366f1",
        });

        setMovieSearchResults((prev) =>
            prev.filter((movie) => movie.id !== movieId)
        );

        const adminUsername =
            localStorage.getItem("username") || "Unknown Admin";
        const now = new Date().toLocaleString();
        const reportResponse = await fetch(reportsApiUrl, {
          method: "POST",
          headers: apiService.getHeaders(true),
          body: JSON.stringify({
            title: "DELETION: MOVIE",
            details: `${adminUsername} deleted movie with ID ${movieId} at ${now}`,
          }),
        });

        if (reportResponse.ok) {
          MySwal.fire({
            icon: "success",
            title: "Report Sent",
            text: "Report successfully sent to manager.",
            background: "#1f2937",
            color: "#fff",
            confirmButtonColor: "#6366f1",
          });
        }
      } else {
        throw new Error("Failed to delete movie");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete movie!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const searchMoviesForEdit = async () => {
    if (!editMovieSearchQuery.trim()) return;
    setEditMovieSearchLoading(true);
    try {
      const response = await fetch(
          `${moviesApiUrl}/search?query=${encodeURIComponent(
              editMovieSearchQuery
          )}`
      );
      if (response.ok) {
        setEditMovieSearchResults(await response.json());
      } else {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Error during movie search!",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#6366f1",
        });
      }
    } catch (error) {
      console.error("Error searching movies for edit:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Error during movie search!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setEditMovieSearchLoading(false);
    }
  };

  const selectMovieForEdit = (movie: Movie) => {
    setSelectedMovieForEdit(movie);
    const movieData = {
      title: movie.title,
      overview: movie.overview,
      trailerUrl: movie.trailerUrl || "",
      posterPath: movie.posterPath || "",
    };
    setEditMovieFormData(movieData);
    setOriginalMovieData(movieData);
    setEditMovieSearchResults([]);
    setEditMovieSearchQuery("");
  };

  const handleEditMovieInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditMovieFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditMovie = async () => {
    if (!selectedMovieForEdit) return;

    const changedFields: Partial<MovieCreateDto> = {};
    (Object.keys(editMovieFormData) as Array<keyof MovieCreateDto>).forEach(
        (key) => {
          if (editMovieFormData[key] !== originalMovieData[key]) {
            changedFields[key] = editMovieFormData[key];
          }
        }
    );

    if (Object.keys(changedFields).length === 0) {
      MySwal.fire({
        icon: "info",
        title: "No Changes",
        text: "No changes detected!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    try {
      const result = await MySwal.fire({
        title: "Confirm Changes",
        text: "Are you sure you want to update this movie?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#6b7280",
        background: "#1f2937",
        color: "#fff",
      });

      if (!result.isConfirmed) return;

      const response = await fetch(
          `${moviesApiUrl}/${selectedMovieForEdit.id}`,
          {
            method: "PUT",
            headers: apiService.getHeaders(true),
            body: JSON.stringify(changedFields),
          }
      );

      if (response.ok) {
        await MySwal.fire({
          icon: "success",
          title: "Success!",
          text: "Movie successfully updated!",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#6366f1",
        });

        setOriginalMovieData(editMovieFormData);
        setSelectedMovieForEdit((prev) =>
            prev ? { ...prev, ...changedFields } : null
        );

        const adminUsername =
            localStorage.getItem("username") || "Unknown Admin";
        const now = new Date().toLocaleString();
        const reportResponse = await fetch(reportsApiUrl, {
          method: "POST",
          headers: apiService.getHeaders(true),
          body: JSON.stringify({
            title: "UPDATE: MOVIE",
            details: `${adminUsername} updated the movie ${
                selectedMovieForEdit.title
            } at ${now}. Changed fields: ${Object.keys(changedFields).join(
                ", "
            )}`,
          }),
        });

        if (reportResponse.ok) {
          MySwal.fire({
            icon: "success",
            title: "Report Sent",
            text: "Report successfully sent to manager.",
            background: "#1f2937",
            color: "#fff",
            confirmButtonColor: "#6366f1",
          });
        }
      } else {
        throw new Error("Failed to update movie");
      }
    } catch (error) {
      console.error("Error updating movie:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update movie!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const cancelEdit = () => {
    setSelectedMovieForEdit(null);
    setEditMovieFormData({
      title: "",
      overview: "",
      trailerUrl: "",
      posterPath: "",
    });
    setOriginalMovieData({
      title: "",
      overview: "",
      trailerUrl: "",
      posterPath: "",
    });
    setEditMovieSearchQuery("");
    setEditMovieSearchResults([]);
  };

  const searchUser = async () => {
    if (!userSearchQuery.trim()) {
      MySwal.fire({
        icon: "warning",
        title: "Required",
        text: "Please enter a username!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    setUserSearchLoading(true);
    setUserSearchResult(null);

    try {
      const response = await fetch(
          `${usersApiUrl}?username=${encodeURIComponent(userSearchQuery)}`,
          {
            method: "GET",
            headers: apiService.getHeaders(true),
          }
      );

      if (response.ok) {
        const data = await response.json();
        const user = Array.isArray(data)
            ? data.find(
                (u) => u.username.toLowerCase() === userSearchQuery.toLowerCase()
            )
            : data;

        if (user && user.id) {
          setUserSearchResult(user);
          setSelectedRole(user.userRole || 0);
        } else {
          setUserSearchResult(null);
          MySwal.fire({
            icon: "error",
            title: "Not Found",
            text: "User not found.",
            background: "#1f2937",
            color: "#fff",
            confirmButtonColor: "#6366f1",
          });
        }
      } else {
        setUserSearchResult(null);
        throw new Error("Failed to search user");
      }
    } catch (error) {
      console.error("Error searching user:", error);
      setUserSearchResult(null);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to search user!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setUserSearchLoading(false);
    }
  };

  const changeUserRole = async () => {
    if (!userSearchResult) {
      MySwal.fire({
        icon: "warning",
        title: "Required",
        text: "Please search for a user first!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    if (userSearchResult.userRole === selectedRole) {
      MySwal.fire({
        icon: "info",
        title: "No Change",
        text: "Selected role is already the user's current role!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    try {
      const result = await MySwal.fire({
        title: "Confirm Role Change",
        html: `Are you sure you want to change <strong>${
            userSearchResult.username
        }</strong>'s role from <strong>${
            roleMap[userSearchResult.userRole] || "Unknown"
        }</strong> to <strong>${roleMap[selectedRole] || "Unknown"}</strong>?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#6b7280",
        background: "#1f2937",
        color: "#fff",
      });

      if (!result.isConfirmed) return;

      const response = await fetch(`${usersApiUrl}/${userSearchResult.id}`, {
        method: "PUT",
        headers: apiService.getHeaders(true),
        body: JSON.stringify({ userRole: selectedRole }),
      });

      if (response.ok) {
        await MySwal.fire({
          icon: "success",
          title: "Success!",
          text: "User role successfully updated!",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#6366f1",
        });

        const oldRole = userSearchResult.userRole;
        setUserSearchResult((prev) =>
            prev ? { ...prev, userRole: selectedRole } : null
        );

        const adminUsername =
            localStorage.getItem("username") || "Unknown Admin";
        const now = new Date().toLocaleString();
        const reportResponse = await fetch(reportsApiUrl, {
          method: "POST",
          headers: apiService.getHeaders(true),
          body: JSON.stringify({
            title: "ROLE CHANGE",
            details: `${adminUsername} changed ${
                userSearchResult.username
            }'s role from ${roleMap[oldRole] || "Unknown"} to ${
                roleMap[selectedRole] || "Unknown"
            } at ${now}`,
          }),
        });

        if (reportResponse.ok) {
          MySwal.fire({
            icon: "success",
            title: "Report Sent",
            text: "Report successfully sent to manager.",
            background: "#1f2937",
            color: "#fff",
            confirmButtonColor: "#6366f1",
          });
        }
      } else {
        throw new Error("Failed to change role");
      }
    } catch (error) {
      console.error("Error changing user role:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to change role!",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#6366f1",
      });
    }
  };

  const clearSearch = () => {
    setUserSearchQuery("");
    setUserSearchResult(null);
    setSelectedRole(0);
  };

  return (
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-indigo-950 text-white font-sans min-h-screen">
        {sidebarOpen && (
            <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={toggleSidebar}
                aria-hidden="true"
            />
        )}

        <div className="flex min-h-screen">
          <nav
              id="sidebar"
              className={`fixed top-0 left-0 lg:sticky lg:top-0 lg:translate-x-0 w-full sm:w-64 lg:w-72 bg-white/10 backdrop-blur-xl border-r border-white/20 h-screen lg:self-start overflow-y-auto z-50 transition-transform duration-300 ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
              aria-label="Main navigation"
          >
            <div className="p-4 sm:p-6 text-center border-b border-white/10 bg-purple-600/20">
              <div className="flex justify-center items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl sm:text-2xl">
                  🎬
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Moviemo
              </h1>
              <p className="text-xs sm:text-sm text-white/70">Admin Panel</p>
            </div>

            <div className="py-3 sm:py-5">
              {[
                { id: "homepage", icon: "🏠", label: "Home" },
                { id: "add-movie", icon: "🎬", label: "Add Movie" },
                { id: "edit-movie", icon: "✏️", label: "Edit Movie" },
                { id: "remove-movie", icon: "🗑️", label: "Remove Movie" },
                ...(userRole === "2"
                    ? [
                      { id: "reports", icon: "📊", label: "Reports" },
                    ]
                    : []),
                ...(userRole === "1" || userRole === "2" ? [{ id: "feedback", icon: "💬", label: "User Feedback" }] : []),
                ...(userRole === "1"
                    ? [
                      { id: "roles", icon: "🔑", label: "Change Role" },
                    ]
                    : []),
              ].map((item) => (
                  <button
                      key={item.id}
                      className={`flex items-center w-full py-2 px-4 sm:py-3 sm:px-6 text-white/80 text-sm sm:text-base font-medium hover:bg-white/10 hover:text-white transition-all duration-300 ${
                          activeSection === item.id
                              ? "bg-gradient-to-r from-purple-500/30 to-pink-500/20 border-l-4 border-purple-500"
                              : ""
                      }`}
                      onClick={() => showSection(item.id)}
                      aria-current={activeSection === item.id ? "page" : undefined}
                  >
                <span className="mr-3 text-lg sm:mr-4 sm:text-xl w-6 text-center">
                  {item.icon}
                </span>
                    {item.label}
                  </button>
              ))}
            </div>
          </nav>

          <main className="flex-1 w-full overflow-x-hidden">
            <div className="lg:hidden sticky top-0 z-30 bg-white/10 backdrop-blur-xl border-b border-white/20 p-3 sm:p-4">
              <button
                  onClick={toggleSidebar}
                  className="flex items-center p-2 sm:p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                  aria-expanded={sidebarOpen}
              >
                <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span className="text-sm sm:text-base font-semibold">
                Actions
              </span>
              </button>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {activeSection === "homepage" && (
                  <div className="content-section">
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                        Welcome!
                      </h1>
                      <p className="text-sm sm:text-base text-white/80">
                        Welcome to Moviemo admin panel. Designed for movie lovers ❤️
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      {[
                        {
                          icon: "🎥",
                          title: "Movie Management",
                          desc: "Add new movies to the system or remove existing ones.",
                        },
                        {
                          icon: "👤",
                          title: "User Management",
                          desc: "Review and manage user accounts.",
                        },
                        {
                          icon: "📈",
                          title: "Analytics & Reports",
                          desc: "View detailed reports and statistics.",
                        },
                        {
                          icon: "⚙️",
                          title: "System Settings",
                          desc: "Manage user roles and permissions.",
                        },
                      ].map((card, index) => (
                          <div
                              key={index}
                              className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl hover:border-purple-500/50 transition-all duration-300"
                          >
                      <span className="text-4xl sm:text-5xl block mb-4 sm:mb-5">
                        {card.icon}
                      </span>
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                              {card.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                              {card.desc}
                            </p>
                          </div>
                      ))}
                    </div>
                  </div>
              )}

              {/* UPDATED FEEDBACK SECTION */}
              {activeSection === "feedback" && (userRole === "1" || userRole === "2") && (
                  <div className="content-section">
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                        User Feedback
                      </h1>
                      <p className="text-sm sm:text-base text-white/80">
                        View and manage user feedback submissions
                      </p>
                    </div>
                    <div className="p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-4xl mx-auto">
                      {feedbackLoading ? (
                          <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                            <p className="mt-2 text-white/80">Loading feedback...</p>
                          </div>
                      ) : feedbacks.length > 0 ? (
                          <div className="space-y-3 mb-6">
                            {feedbacks.map((feedback) => (
                                <div key={feedback.id} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-semibold text-white">{feedback.name}</h4>
                                      <p className="text-sm text-purple-300">{feedback.email}</p>
                                      <p className="mt-2 text-white/90">{feedback.message}</p>
                                      <p className="text-xs text-white/60 mt-2">
                                        {new Date(feedback.submittedAt).toLocaleString()}
                                      </p>
                                    </div>
                                    <button
                                        onClick={() => deleteFeedback(feedback.id)}
                                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="text-center text-white/70 py-6 sm:py-8">No feedback found.</div>
                      )}
                    </div>
                  </div>
              )}

              {activeSection === "add-movie" && (
                  <div className="content-section">
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                        Add Movie
                      </h1>
                      <p className="text-sm sm:text-base text-white/80">
                        Fill out the form to add a new movie to the system
                      </p>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-lg mx-auto">
                      <div className="space-y-4 sm:space-y-5">
                        <div>
                          <label
                              htmlFor="add_title"
                              className="block mb-1 sm:mb-2 text-sm sm:text-base text-white/90 font-medium"
                          >
                            Title
                          </label>
                          <input
                              id="add_title"
                              type="text"
                              name="title"
                              value={addMovieFormData.title}
                              onChange={handleAddMovieInputChange}
                              className="w-full p-2 sm:p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                              placeholder="Enter movie title"
                          />
                        </div>

                        <div>
                          <label
                              htmlFor="add_overview"
                              className="block mb-1 sm:mb-2 text-sm sm:text-base text-white/90 font-medium"
                          >
                            Overview
                          </label>
                          <textarea
                              id="add_overview"
                              name="overview"
                              value={addMovieFormData.overview}
                              onChange={handleAddMovieInputChange}
                              className="w-full p-2 sm:p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                              rows={4}
                              placeholder="Enter movie description"
                          />
                        </div>

                        <div>
                          <label
                              htmlFor="add_posterPath"
                              className="block mb-1 sm:mb-2 text-sm sm:text-base text-white/90 font-medium"
                          >
                            Poster URL
                          </label>
                          <input
                              id="add_posterPath"
                              type="url"
                              name="posterPath"
                              value={addMovieFormData.posterPath}
                              onChange={handleAddMovieInputChange}
                              className="w-full p-2 sm:p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                              placeholder="https://example.com/poster.jpg "
                          />
                        </div>

                        <div>
                          <label
                              htmlFor="add_trailerUrl"
                              className="block mb-1 sm:mb-2 text-sm sm:text-base text-white/90 font-medium"
                          >
                            Trailer URL
                          </label>
                          <input
                              id="add_trailerUrl"
                              type="url"
                              name="trailerUrl"
                              value={addMovieFormData.trailerUrl}
                              onChange={handleAddMovieInputChange}
                              className="w-full p-2 sm:p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                              placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>

                        <button
                            className="w-full p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                            onClick={handleAddMovie}
                        >
                          Add Movie
                        </button>
                      </div>
                    </div>
                  </div>
              )}

              {activeSection === "edit-movie" && (
                  <div className="content-section">
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                        Edit Movie
                      </h1>
                      <p className="text-sm sm:text-base text-white/80">
                        Search for the movie you want to edit and select it
                      </p>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-3xl mx-auto">
                      {!selectedMovieForEdit ? (
                          <>
                            <div className="mb-4 sm:mb-6">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={editMovieSearchQuery}
                                    onChange={(e) =>
                                        setEditMovieSearchQuery(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && searchMoviesForEdit()
                                    }
                                    className="flex-1 w-full p-2 sm:p-3 border rounded-lg bg-white/10 text-white border-white/25 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                    placeholder="Enter movie title to edit..."
                                />
                                <button
                                    onClick={searchMoviesForEdit}
                                    disabled={editMovieSearchLoading}
                                    className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                                >
                                  {editMovieSearchLoading ? "🔍..." : "Search"}
                                </button>
                              </div>
                            </div>

                            {editMovieSearchResults.length > 0 && (
                                <div className="space-y-3">
                                  <h3 className="text-lg text-white font-semibold mb-3">
                                    Select a movie to edit:
                                  </h3>
                                  {editMovieSearchResults.map((movie) => (
                                      <div
                                          key={movie.id}
                                          className="flex items-center justify-between p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                          onClick={() => selectMovieForEdit(movie)}
                                      >
                                        <div className="flex items-center space-x-2 sm:space-x-4">
                                          {movie.posterPath && (
                                              <img
                                                  src={movie.posterPath}
                                                  alt={movie.title}
                                                  className="w-10 h-12 sm:w-12 sm:h-16 object-cover rounded"
                                              />
                                          )}
                                          <div>
                                            <h3 className="text-sm sm:text-base text-white font-semibold">
                                              {movie.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-white/70 line-clamp-2">
                                              {movie.overview}
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                          ✏️
                                        </button>
                                      </div>
                                  ))}
                                </div>
                            )}

                            {editMovieSearchQuery &&
                                editMovieSearchResults.length === 0 &&
                                !editMovieSearchLoading && (
                                    <div className="text-center text-white/70 py-6 sm:py-8">
                                      No movies found matching your search criteria.
                                    </div>
                                )}
                          </>
                      ) : (
                          <div className="max-w-lg mx-auto">
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                              <h3 className="text-sm sm:text-base text-white font-semibold mb-2">
                                Editing Movie:
                              </h3>
                              <p className="text-white/80 text-sm sm:text-base">
                                {selectedMovieForEdit.title}
                              </p>
                              <button
                                  onClick={cancelEdit}
                                  className="mt-2 text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                              >
                                ← Select different movie
                              </button>
                            </div>

                            <div className="space-y-4 sm:space-y-5">
                              <div>
                                <label
                                    htmlFor="edit_title"
                                    className="block mb-1 sm:mb-2 text-sm sm:text-base font-medium text-white/90"
                                >
                                  Title
                                </label>
                                <input
                                    id="edit_title"
                                    type="text"
                                    name="title"
                                    value={editMovieFormData.title}
                                    onChange={handleEditMovieInputChange}
                                    className="w-full p-2 sm:p-3 border rounded-lg bg-white/10 text-white border-white/25 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                    placeholder="Enter movie title"
                                />
                              </div>
                              <div>
                                <label
                                    htmlFor="edit_overview"
                                    className="block mb-1 sm:mb-2 text-sm sm:text-base font-medium text-white/90"
                                >
                                  Overview
                                </label>
                                <textarea
                                    id="edit_overview"
                                    name="overview"
                                    value={editMovieFormData.overview}
                                    onChange={handleEditMovieInputChange}
                                    className="w-full p-2 sm:p-3 border rounded-lg bg-white/10 text-white border-white/25 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                    rows={4}
                                    placeholder="Enter movie description"
                                />
                              </div>
                              <div>
                                <label
                                    htmlFor="edit_posterPath"
                                    className="block mb-1 sm:mb-2 text-sm sm:text-base font-medium text-white/90"
                                >
                                  Poster URL
                                </label>
                                <input
                                    id="edit_posterPath"
                                    type="url"
                                    name="posterPath"
                                    value={editMovieFormData.posterPath}
                                    onChange={handleEditMovieInputChange}
                                    className="w-full p-2 sm:p-3 border rounded-lg bg-white/10 text-white border-white/25 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                    placeholder=" https://example.com/poster.jpg "
                                />
                              </div>
                              <div>
                                <label
                                    htmlFor="edit_trailerUrl"
                                    className="block mb-1 sm:mb-2 text-sm sm:text-base font-medium text-white/90"
                                >
                                  Trailer URL
                                </label>
                                <input
                                    id="edit_trailerUrl"
                                    type="url"
                                    name="trailerUrl"
                                    value={editMovieFormData.trailerUrl}
                                    onChange={handleEditMovieInputChange}
                                    className="w-full p-2 sm:p-3 border rounded-lg bg-white/10 text-white border-white/25 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button
                                    className="w-full sm:flex-1 p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                    onClick={handleEditMovie}
                                >
                                  Save Changes
                                </button>
                                <button
                                    className="w-full sm:flex-1 p-2 sm:p-3 bg-gray-500/30 text-white font-semibold rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                                    onClick={cancelEdit}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
              )}

              {activeSection === "remove-movie" && (
                  <div className="content-section">
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                        Remove Movie
                      </h1>
                      <p className="text-sm sm:text-base text-white/80">
                        Use this interface to remove movies from the system
                      </p>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-3xl mx-auto">
                      <div className="mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                              type="text"
                              value={movieSearchQuery}
                              onChange={(e) => setMovieSearchQuery(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && searchMovies()}
                              className="flex-1 w-full p-2 sm:p-3 border rounded-lg bg-white/10 text-white border-white/25 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                              placeholder="Enter movie title..."
                          />
                          <button
                              onClick={searchMovies}
                              disabled={movieSearchLoading}
                              className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                          >
                            {movieSearchLoading ? "🔍..." : "Search"}
                          </button>
                        </div>
                      </div>

                      {movieSearchResults.length > 0 && (
                          <div className="space-y-3">
                            {movieSearchResults.map((movie) => (
                                <div
                                    key={movie.id}
                                    className="flex items-center justify-between p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex items-center space-x-2 sm:space-x-4">
                                    {movie.posterPath && (
                                        <img
                                            src={movie.posterPath}
                                            alt={movie.title}
                                            className="w-10 h-12 sm:w-12 sm:h-16 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                      <h3 className="text-sm sm:text-base text-white font-semibold">
                                        {movie.title}
                                      </h3>
                                      <p className="text-xs sm:text-sm text-white/70 line-clamp-2">
                                        {movie.overview}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                      onClick={() => deleteMovie(movie.id)}
                                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                      title="Delete Movie"
                                  >
                                    🗑️
                                  </button>
                                </div>
                            ))}
                          </div>
                      )}

                      {movieSearchQuery &&
                          movieSearchResults.length === 0 &&
                          !movieSearchLoading && (
                              <div className="text-center text-white/70 py-6 sm:py-8">
                                No movies found matching your search criteria.
                              </div>
                          )}
                    </div>
                  </div>
              )}

              {activeSection === "reports" && (userRole === "1" || userRole === "2") && (
                  <div className="content-section">
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                        Reports
                      </h1>
                      <p className="text-sm sm:text-base text-white/80">
                        View detailed reports and statistics
                      </p>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-3xl mx-auto">
                      {reportsLoading ? (
                          <div className="text-center text-white/70 py-6 sm:py-8">
                            Loading reports...
                          </div>
                      ) : reports.length > 0 ? (
                          <div className="space-y-3">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg"
                                >
                                  <h3 className="text-sm sm:text-base text-white font-semibold">
                                    {report.title}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-white/70">
                                    {report.details}
                                  </p>
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="text-center text-white/70 py-6 sm:py-8">
                            No reports available.
                          </div>
                      )}
                    </div>
                  </div>
              )}

              {activeSection === "roles" && userRole === "1" && (
                  <div className="content-section">
                    <div className="mb-4 sm:mb-6 p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                        Change Role
                      </h1>
                      <p className="text-sm sm:text-base text-white/80">
                        To change a user's role, search by username.
                      </p>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-lg mx-auto">
                      <div className="mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                              type="text"
                              id="user_search_query"
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && searchUser()}
                              className="flex-1 w-full p-2 sm:p-3 border border-white/20 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                              placeholder="Enter username..."
                              aria-label="Search username"
                          />
                          <button
                              onClick={searchUser}
                              disabled={userSearchLoading}
                              className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                              aria-busy={userSearchLoading}
                          >
                            {userSearchLoading ? "Searching..." : "Search"}
                          </button>
                        </div>
                      </div>

                      {userSearchResult && (
                          <div className="space-y-4">
                            <div className="p-2 sm:p-4 bg-white/5 border border-white/10 rounded-lg">
                              <p className="text-sm sm:text-base text-white">
                                <span className="font-semibold">Username:</span>{" "}
                                {userSearchResult.username}
                              </p>
                              <p className="text-sm sm:text-base text-white">
                                <span className="font-semibold">Current Role:</span>{" "}
                                {roleMap[userSearchResult.userRole] || "Unknown"}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                              <select
                                  id="role_select"
                                  value={selectedRole}
                                  onChange={(e) =>
                                      setSelectedRole(Number(e.target.value))
                                  }
                                  className="flex-1 w-full p-2 sm:p-3 border border-white/20 rounded-lg bg-gray-800/50 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                  aria-label="Select role"
                              >
                                <option value={0}>Basic</option>
                                <option value={1}>Admin</option>
                                <option value={2}>Manager</option>
                              </select>

                              <button
                                  onClick={changeUserRole}
                                  className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-br from-green-500 to-teal-600 text-white font-semibold rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                              >
                                Confirm
                              </button>
                            </div>

                            <button
                                onClick={clearSearch}
                                className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                            >
                              New Search
                            </button>
                          </div>
                      )}

                      {userSearchQuery &&
                          !userSearchResult &&
                          !userSearchLoading && (
                              <div className="text-center text-white/70 py-6 sm:py-8">
                                User not found.
                              </div>
                          )}
                    </div>
                  </div>
              )}
            </div>
          </main>
        </div>
      </div>
  );
};
export default AdminPanel;