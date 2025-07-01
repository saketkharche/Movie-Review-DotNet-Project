"use client";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { apiService } from "../services/api";
import { getCurrentUserId, getCurrentUserRole } from "../utils/user";

interface SearchResult {
  id: number;
  title: string;
  posterPath: string;
}

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchApiUrl = "https://localhost:7179/api/movies/search?Query=";

  // Memoize handleLogin as it's used in a useEffect dependency array
  const handleLogin = useCallback(() => {
    if (apiService.isAuthenticated()) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    apiService.logout();
    setIsDropdownOpen(false);
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    setCurrentUserId(null);
    setUserRole(null);
  };

  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
          searchApiUrl + `${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: apiService.getHeaders(),
          }
      );
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results || []);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchMovies(query);
    }, 300);
  };

  const handleSearchResultClick = (movieId: number) => {
    setSearchQuery("");
    setShowSearchResults(false);
    setShowMobileSearch(false);
    setIsMobileMenuOpen(false);
    window.location.href = `/movie/${movieId}`;
  };

  // Check auth status on mount and when 'userLoggedIn' event occurs
  useEffect(() => {
    setIsLoggedIn(apiService.isAuthenticated());
    window.addEventListener("userLoggedIn", handleLogin);
    return () => {
      window.removeEventListener("userLoggedIn", handleLogin);
    };
  }, [handleLogin]);

  // Fetch user ID and role when login status changes
  useEffect(() => {
    const getAuthDetails = async () => {
      if (isLoggedIn) {
        const id = await getCurrentUserId();
        setCurrentUserId(id);
        if (id !== null) {
          const role = await getCurrentUserRole();
          setUserRole(String(role));
        } else {
          setUserRole(null);
        }
      } else {
        setCurrentUserId(null);
        setUserRole(null);
      }
    };
    getAuthDetails();
  }, [isLoggedIn]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
          searchRef.current &&
          !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup search timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle window resize for mobile menu
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setShowMobileSearch(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAdmin = userRole === "1" || userRole === "2";

  return (
      <nav className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white shadow-2xl backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
                href="/"
                className="group flex items-center space-x-2 flex-shrink-0 transform hover:scale-105 transition-transform duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-rose-500/20">
                <span className="text-white font-extrabold text-lg">M</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
              Moviemo
            </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative" ref={searchRef}>
              {/* Desktop Search Bar */}
              <div className="relative w-full">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2.5 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {isSearching ? (
                      <div className="w-5 h-5 border-2 border-white/50 border-t-purple-400 rounded-full animate-spin"></div>
                  ) : (
                      <svg
                          className="w-5 h-5 text-white/70"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                  )}
                </div>
              </div>
              {/* Search Results Dropdown */}
              {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/5 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 z-[60] max-h-96 overflow-y-auto animate-fadeIn">
                    {searchResults.length > 0 ? (
                        <div className="p-2">
                          {searchResults.map((movie) => (
                              <div
                                  key={movie.id}
                                  onClick={() => handleSearchResultClick(movie.id)}
                                  className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-200 transform hover:translate-x-1"
                              >
                                <div className="w-12 h-16 bg-white/5 rounded-md overflow-hidden flex-shrink-0 border border-white/10 shadow-md">
                                  {movie.posterPath ? (
                                      <img
                                          src={movie.posterPath}
                                          alt={movie.title}
                                          className="w-full h-full object-cover"
                                      />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <svg
                                            className="w-6 h-6 text-white/50"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"
                                          />
                                        </svg>
                                      </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-white font-medium truncate hover:text-purple-300 transition-colors duration-200">
                                    {movie.title}
                                  </h3>
                                </div>
                              </div>
                          ))}
                        </div>
                    ) : searchQuery && !isSearching ? (
                        <div className="p-4 text-center text-white/70">
                          <svg
                              className="w-12 h-12 mx-auto mb-2 text-purple-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                          >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <p>No results found</p>
                        </div>
                    ) : null}
                  </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {/* TV Shows Link - New */}
              <Link
                  href="/tv-shows"
                  className="relative px-3 py-2 text-white/80 hover:text-white transition-all duration-300 group"
              >
                <span className="relative z-10">TV Shows</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-500"></span>
              </Link>

              {/* IMDB Link */}
              <Link
                  href="/IMDB"
                  className="relative px-3 py-2 text-white/80 hover:text-white transition-all duration-300 group"
              >
                <span className="relative z-10">Explore</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-500"></span>
              </Link>

              {isLoggedIn && isAdmin && (
                  <Link
                      href="/admin"
                      className="relative px-3 py-2 text-white/80 hover:text-white transition-all duration-300 group"
                  >
                    <span className="relative z-10">Admin</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-500"></span>
                  </Link>
              )}

              <Link
                  href="/about"
                  className="relative px-3 py-2 text-white/80 hover:text-white transition-all duration-300 group"
              >
                <span className="relative z-10">About</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-500"></span>
              </Link>

              {isLoggedIn ? (
                  <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-white/10 hover:shadow-lg hover:shadow-white/20"
                    >
                      <span className="text-white hidden lg:block">Account</span>
                      <svg
                          className={`w-4 h-4 text-white transition-transform duration-300 ${
                              isDropdownOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isDropdownOpen && currentUserId !== null && (
                        <div className="absolute right-0 mt-2 w-56 bg-white/5 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 z-[70] overflow-hidden animate-scaleIn">
                          <div className="p-2">
                            <Link
                                href={`/profile/${currentUserId}`}
                                className="flex items-center space-x-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg
                                  className="w-5 h-5 text-purple-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                              >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span>Profile</span>
                            </Link>
                            <div className="h-px bg-white/10 my-2"></div>
                            <Link
                                href="/login"
                                className="flex items-center space-x-3 px-4 py-3 text-white/90 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                                onClick={handleLogout}
                            >
                              <svg
                                  className="w-5 h-5 text-red-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                              >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                              </svg>
                              <span>Logout</span>
                            </Link>
                          </div>
                        </div>
                    )}
                  </div>
              ) : (
                  <Link
                      href="/login"
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Login
                  </Link>
              )}
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  className="p-2 text-white/80 hover:text-white transition-colors duration-200"
              >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-white/80 hover:text-white transition-colors duration-200"
              >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isMobileMenuOpen
                            ? "M6 18L18 6M6 6l12 12"
                            : "M4 6h16M4 12h16M4 18h16"
                      }
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
              <div className="md:hidden mt-4 relative" ref={searchRef}>
                <div className="relative">
                  <input
                      type="text"
                      placeholder="Search movies..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full px-4 py-2.5 pl-11 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                      onFocus={() => searchQuery && setShowSearchResults(true)}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {isSearching ? (
                        <div className="w-5 h-5 border-2 border-white/50 border-t-purple-400 rounded-full animate-spin"></div>
                    ) : (
                        <svg
                            className="w-5 h-5 text-white/70"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                    )}
                  </div>
                </div>
                {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/5 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 z-[60] max-h-80 overflow-y-auto">
                      {searchResults.length > 0 ? (
                          <div className="p-2">
                            {searchResults.map((movie) => (
                                <div
                                    key={movie.id}
                                    onClick={() => handleSearchResultClick(movie.id)}
                                    className="flex items-center space-x-3 p-3 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-200"
                                >
                                  <div className="w-10 h-14 bg-white/5 rounded-md overflow-hidden flex-shrink-0 border border-white/10 shadow-md">
                                    {movie.posterPath ? (
                                        <img
                                            src={movie.posterPath}
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <svg
                                              className="w-5 h-5 text-white/50"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                          >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"
                                            />
                                          </svg>
                                        </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium text-sm truncate">
                                      {movie.title}
                                    </h3>
                                  </div>
                                </div>
                            ))}
                          </div>
                      ) : searchQuery && !isSearching ? (
                          <div className="p-4 text-center text-white/70">
                            <svg
                                className="w-10 h-10 mx-auto mb-2 text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                            <p className="text-sm">No results found</p>
                          </div>
                      ) : null}
                    </div>
                )}
              </div>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-white/10">
                <div className="flex flex-col space-y-4 pt-4">
                  {/* TV Shows Link - New */}
                  <Link
                      href="/tv-shows"
                      className="text-white/80 hover:text-white transition-colors duration-200 px-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                  >
                    TV Shows
                  </Link>

                  {/* IMDB Link for Mobile */}
                  <Link
                      href="/IMDB"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white transition-colors duration-200 px-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Explore
                  </Link>

                  {isLoggedIn && isAdmin && (
                      <Link
                          href="/admin"
                          className="text-white/80 hover:text-white transition-colors duration-200 px-2 py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                  )}

                  <Link
                      href="/about"
                      className="text-white/80 hover:text-white transition-colors duration-200 px-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>

                  {isLoggedIn ? (
                      <>
                        {currentUserId !== null && (
                            <Link
                                href={`/profile/${currentUserId}`}
                                className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors duration-200 px-2 py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                              Profile
                            </Link>
                        )}
                        <button
                            onClick={() => {
                              handleLogout();
                            }}
                            className="flex items-center space-x-3 text-white/80 hover:text-red-400 transition-colors duration-200 px-2 py-2 text-left"
                        >
                          <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                          >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </>
                  ) : (
                      <Link
                          href="/login"
                          className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105"
                          onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                  )}
                </div>
              </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.2s ease-out forwards;
          }
        `}</style>
      </nav>
  );
}