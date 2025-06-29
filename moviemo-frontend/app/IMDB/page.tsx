"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaSearch,
  FaStar,
  FaArrowLeft,
  FaArrowRight,
  FaFilm,
} from "react-icons/fa";

export default function MovieSearchPage() {
  const [query, setQuery] = useState("Avengers");
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const API_KEY = "5be075a5";
  const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

  useEffect(() => {
    searchInputRef.current?.focus();
    searchMovies(query, page);
  }, []);

  const searchMovies = useCallback(async (searchTerm: string, pageNum = 1) => {
    if (!searchTerm.trim()) {
      setMovies([]);
      setSelectedMovie(null);
      setError("Please enter a movie name.");
      return;
    }

    setLoading(true);
    setError("");
    setSelectedMovie(null);

    try {
      const response = await fetch(
          `${API_URL}&s=${encodeURIComponent(searchTerm)}&page=${pageNum}`
      );
      const data = await response.json();

      if (data.Response === "True") {
        setMovies(data.Search);
        setTotalResults(parseInt(data.totalResults));
      } else {
        setMovies([]);
        setError(data.Error || "No results found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch movies. Check your internet connection.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMovieDetails = async (imdbID: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}&i=${imdbID}&plot=full`);
      const data = await response.json();

      if (data.Response === "True") {
        setSelectedMovie(data);
      } else {
        setError("Failed to load movie details.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch movie details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchMovies(query, 1);
      setPage(1);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(totalResults / 10);
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      searchMovies(query, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderStars = (rating: string) => {
    if (!rating || rating === "N/A") return null;
    const num = parseFloat(rating.split("/")[0]);
    const starCount = Math.round(num / 2);
    return (
        <div className="flex items-center mt-1">
          {[...Array(5)].map((_, i) => (
              <FaStar
                  key={i}
                  className={`text-lg ${i < starCount ? "text-yellow-400" : "text-gray-700"}`}
              />
          ))}
          <span className="ml-2 text-gray-400">{rating}</span>
        </div>
    );
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <main className="container mx-auto px-4 py-8">
          {/* Branding */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
              Movie Explorer
            </h1>
            <p className="text-gray-400">Discover your next favorite movie</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-12 text-center">
            <div className="relative">
              <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for movies, series, episodes..."
                  className="w-full px-6 py-4 pl-14 bg-gray-800 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg"
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-red-500 rounded-full animate-spin"></div>
                ) : (
                    <FaSearch className="text-xl text-gray-500" />
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
              <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl border border-gray-600 text-center mb-8">
                <h2 className="text-xl font-bold mb-2">Oops!</h2>
                <p className="text-gray-300">{error}</p>
              </div>
          )}

          {/* Movie Detail */}
          {selectedMovie ? (
              <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
                <button
                    onClick={() => setSelectedMovie(null)}
                    className="flex items-center text-gray-400 hover:text-white mb-6"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to results
                </button>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    {selectedMovie.Poster !== "N/A" ? (
                        <img
                            src={selectedMovie.Poster}
                            alt={selectedMovie.Title}
                            className="w-full rounded-lg shadow-lg"
                        />
                    ) : (
                        <div className="bg-gray-900 h-96 flex items-center justify-center rounded-lg border border-dashed border-gray-600">
                          <FaFilm className="text-4xl text-gray-600" />
                        </div>
                    )}
                  </div>
                  <div className="md:w-2/3 space-y-4">
                    <h2 className="text-3xl font-bold">{selectedMovie.Title}</h2>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="bg-red-500 px-3 py-1 rounded-full">{selectedMovie.Year}</span>
                      <span className="bg-blue-500 px-3 py-1 rounded-full">{selectedMovie.Type}</span>
                      <span className="bg-gray-600 px-3 py-1 rounded-full">{selectedMovie.Rated}</span>
                    </div>
                    {renderStars(selectedMovie.imdbRating)}
                    <p className="text-gray-300">{selectedMovie.Plot}</p>
                    <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-400">
                      <p><strong>Director:</strong> {selectedMovie.Director}</p>
                      <p><strong>Writer:</strong> {selectedMovie.Writer}</p>
                      <p><strong>Actors:</strong> {selectedMovie.Actors}</p>
                      <p><strong>Awards:</strong> {selectedMovie.Awards}</p>
                    </div>
                    <a
                        href={`https://www.imdb.com/title/${selectedMovie.imdbID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition"
                    >
                      View on IMDb
                    </a>
                  </div>
                </div>
              </div>
          ) : (
              <>
                {/* Movie Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {movies.map((movie) => (
                      <div
                          key={movie.imdbID}
                          onClick={() => getMovieDetails(movie.imdbID)}
                          className="group bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl overflow-hidden border border-gray-700 transition transform hover:-translate-y-2 shadow-lg cursor-pointer"
                      >
                        <div className="h-80 overflow-hidden">
                          {movie.Poster !== "N/A" ? (
                              <img
                                  src={movie.Poster}
                                  alt={movie.Title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                <FaFilm className="text-5xl text-gray-600" />
                              </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold">{movie.Title}</h3>
                          <p className="text-sm text-gray-400">{movie.Year}</p>
                        </div>
                      </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalResults > 10 && (
                    <div className="flex justify-center gap-3 mb-10">
                      <button
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                          className={`px-4 py-2 rounded-md ${
                              page === 1
                                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                      >
                        <FaArrowLeft />
                      </button>
                      {[...Array(Math.min(5, Math.ceil(totalResults / 10)))].map((_, i) => (
                          <button
                              key={i + 1}
                              onClick={() => handlePageChange(i + 1)}
                              className={`px-4 py-2 rounded-md font-bold ${
                                  page === i + 1
                                      ? "bg-pink-600 text-white"
                                      : "bg-gray-700 hover:bg-gray-600 text-white"
                              }`}
                          >
                            {i + 1}
                          </button>
                      ))}
                      <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page >= Math.ceil(totalResults / 10)}
                          className={`px-4 py-2 rounded-md ${
                              page >= Math.ceil(totalResults / 10)
                                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                      >
                        <FaArrowRight />
                      </button>
                    </div>
                )}
              </>
          )}
        </main>
      </div>
  );
}
