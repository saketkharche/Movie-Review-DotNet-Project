// app/imdb/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaStar,
  FaArrowLeft,
  FaArrowRight,
  FaFilm,
} from "react-icons/fa";

export default function MovieSearchPage() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const API_KEY = "5be075a5";
  const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Default load
    if (!query.trim()) {
      setQuery("Avengers");
    }
  }, []);

  const searchMovies = async (pageNum = 1) => {
    if (!query.trim()) {
      setMovies([]);
      setSelectedMovie(null);
      return;
    }

    setLoading(true);
    setError("");
    setSelectedMovie(null);

    try {
      const response = await fetch(
        `${API_URL}&s=${encodeURIComponent(query)}&page=${pageNum}`
      );
      const data = await response.json();

      if (data.Response === "True") {
        setMovies(data.Search);
        setTotalResults(parseInt(data.totalResults));
      } else {
        setMovies([]);
        setError(data.Error || "No results found");
      }
    } catch (err) {
      setError("Failed to fetch movies");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const getMovieDetails = async (imdbID: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}&i=${imdbID}&plot=full`);
      const data = await response.json();

      if (data.Response === "True") {
        setSelectedMovie(data);
      } else {
        setError("Failed to load movie details");
      }
    } catch (err) {
      setError("Failed to fetch movie details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query) {
        searchMovies();
        setPage(1);
      } else {
        setMovies([]);
        setSelectedMovie(null);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [query]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(totalResults / 10)) {
      setPage(newPage);
      searchMovies(newPage);
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
            className={`text-lg ${
              i < starCount ? "text-yellow-400" : "text-gray-700"
            }`}
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

        {selectedMovie ? (
          <div className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl border-2 border-gray-700/50 overflow-hidden shadow-2xl">
            <div className="p-6 md:p-8">
              <button
                onClick={() => setSelectedMovie(null)}
                className="flex items-center text-gray-400 hover:text-white mb-6"
              >
                <FaArrowLeft className="mr-2" />
                Back to results
              </button>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  {selectedMovie.Poster !== "N/A" ? (
                    <img
                      src={selectedMovie.Poster}
                      alt={selectedMovie.Title}
                      className="w-full max-w-xs rounded-xl shadow-lg"
                    />
                  ) : (
                    <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl w-64 h-96 flex items-center justify-center">
                      <FaFilm className="text-5xl text-gray-700" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h2 className="text-3xl font-bold">
                      {selectedMovie.Title}
                    </h2>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {selectedMovie.Year}
                    </span>
                    <span className="bg-blue-500 px-3 py-1 rounded-full text-sm">
                      {selectedMovie.Type}
                    </span>
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                      {selectedMovie.Rated}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div>
                      <h3 className="text-gray-400 text-sm">Rating</h3>
                      {renderStars(selectedMovie.imdbRating)}
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm">Runtime</h3>
                      <p>{selectedMovie.Runtime}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-400 text-sm">Genre</h3>
                      <p>{selectedMovie.Genre}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-gray-400 mb-2">Plot</h3>
                    <p>{selectedMovie.Plot}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-gray-400 mb-2">Director</h3>
                      <p>{selectedMovie.Director}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-400 mb-2">Writer</h3>
                      <p>{selectedMovie.Writer}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-400 mb-2">Actors</h3>
                      <p>{selectedMovie.Actors}</p>
                    </div>
                    <div>
                      <h3 className="text-gray-400 mb-2">Awards</h3>
                      <p>{selectedMovie.Awards}</p>
                    </div>
                  </div>

                  <a
                    href={`https://www.imdb.com/title/${selectedMovie.imdbID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
                  >
                    View Full Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="max-w-3xl mx-auto bg-gray-800/50 p-8 rounded-2xl border-2 border-gray-700/50 text-center mb-10">
                <h3 className="text-xl font-bold mb-2">No Results Found</h3>
                <p className="text-gray-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {movies.map((movie) => (
                <div
                  key={movie.imdbID}
                  onClick={() => getMovieDetails(movie.imdbID)}
                  className="group bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl overflow-hidden border-2 border-gray-700/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl cursor-pointer"
                >
                  <div className="relative h-80 overflow-hidden">
                    {movie.Poster !== "N/A" ? (
                      <img
                        src={movie.Poster}
                        alt={movie.Title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-4">
                        <FaFilm className="text-5xl text-gray-700 mb-4" />
                        <h3 className="text-center font-bold text-gray-300">
                          {movie.Title}
                        </h3>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <button className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-800 group-hover:from-red-500 group-hover:to-pink-600 text-white font-bold rounded-lg transition-all duration-300">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalResults > 10 && (
              <div className="flex justify-center items-center space-x-4 mb-12">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`flex items-center px-5 py-3 rounded-lg ${
                    page === 1
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-gray-800 hover:bg-gray-700 text-white"
                  }`}
                >
                  <FaArrowLeft className="mr-2" />
                  Previous
                </button>

                <div className="flex space-x-2">
                  {[...Array(Math.min(5, Math.ceil(totalResults / 10)))].map(
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                            page === pageNum
                              ? "bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold"
                              : "bg-gray-800 hover:bg-gray-700 text-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(totalResults / 10)}
                  className={`flex items-center px-5 py-3 rounded-lg ${
                    page >= Math.ceil(totalResults / 10)
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-gray-800 hover:bg-gray-700 text-white"
                  }`}
                >
                  Next
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
