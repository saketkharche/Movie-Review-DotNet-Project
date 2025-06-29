"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaSearch,
  FaStar,
  FaArrowLeft,
  FaArrowRight,
  FaFilm,
  FaHeart,
  FaRegHeart,
  FaTimes,
  FaFilter
} from "react-icons/fa";

const TMDB_READ_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmODBhY2MwMDFhZDkzZWMwZDMxNDE2YmEyNGY0OTU0ZSIsIm5iZiI6MTc1MTE5MDExNi4zNTgsInN1YiI6IjY4NjEwYTY0YWJkMmQyZmJlNDkxNWM3YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.LzpqdZIbOZBFXFmzkbDqp5koMa8lt_LKIh-ef53y5uc";
const OMDB_API_KEY = "5be075a5";
const OMDB_API_URL = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;
const TMDB_API_URL = "https://api.themoviedb.org/3";

export default function MovieSearchPage() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [likedMovies, setLikedMovies] = useState<Record<string, boolean>>({});
  const [popularPage, setPopularPage] = useState(1);
  const [hasMorePopular, setHasMorePopular] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    year: "",
    rating: "",
    genre: ""
  });
  const [genres, setGenres] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastMovieRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`${TMDB_API_URL}/genre/movie/list`, {
          headers: {
            Authorization: `Bearer ${TMDB_READ_TOKEN}`,
            accept: "application/json",
          },
        });
        const data = await res.json();
        if (data.genres) {
          setGenres(data.genres);
        }
      } catch (error) {
        console.error("Failed to fetch genres", error);
      }
    };

    fetchGenres();
  }, []);

  // Fetch popular movies from TMDB
  const fetchPopularMovies = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`${TMDB_API_URL}/movie/popular?page=${pageNum}`, {
        headers: {
          Authorization: `Bearer ${TMDB_READ_TOKEN}`,
          accept: "application/json",
        },
      });
      const data = await res.json();

      if (data.results) {
        setPopularMovies(prev =>
            pageNum === 1 ? data.results : [...prev, ...data.results]
        );
        setHasMorePopular(pageNum < data.total_pages);
      }
    } catch (error) {
      console.error("Failed to fetch popular movies", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search movies using TMDB with OMDB fallback
  const searchMovies = useCallback(async (searchTerm: string, pageNum = 1) => {
    if (!searchTerm.trim()) {
      setMovies([]);
      setSelectedMovie(null);
      setError("");
      setIsSearching(false);
      fetchPopularMovies(1);
      return;
    }

    setLoading(true);
    setError("");
    setSelectedMovie(null);
    setSimilarMovies([]);
    setIsSearching(true);

    try {
      // First try TMDB
      let url = `${TMDB_API_URL}/search/movie?query=${encodeURIComponent(searchTerm)}&page=${pageNum}`;

      // Apply filters
      const params = [];
      if (filters.year) params.push(`year=${filters.year}`);
      if (filters.rating) params.push(`vote_average.gte=${filters.rating}`);
      if (filters.genre) params.push(`with_genres=${filters.genre}`);

      if (params.length > 0) {
        url = `${TMDB_API_URL}/discover/movie?include_adult=false&sort_by=popularity.desc&page=${pageNum}&query=${encodeURIComponent(searchTerm)}&${params.join('&')}`;
      }

      const tmdbRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TMDB_READ_TOKEN}`,
          accept: "application/json",
        },
      });

      const tmdbData = await tmdbRes.json();

      if (tmdbRes.ok && tmdbData.results?.length > 0) {
        setMovies(tmdbData.results);
        setTotalPages(tmdbData.total_pages || 0);
        return;
      }

      // If TMDB fails, try OMDB
      const omdbRes = await fetch(
          `${OMDB_API_URL}&s=${encodeURIComponent(searchTerm)}&page=${pageNum}`
      );
      const omdbData = await omdbRes.json();

      if (omdbData.Response === "True") {
        setMovies(omdbData.Search);
        setTotalPages(Math.ceil(parseInt(omdbData.totalResults) / 10) || 0);
      } else {
        setMovies([]);
        setError(omdbData.Error || "No results found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch movies. Check your internet connection.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get movie details using TMDB with OMDB fallback
  const getMovieDetails = useCallback(async (movie: any) => {
    // Save scroll position before opening movie details
    scrollPositionRef.current = window.scrollY;

    setLoading(true);
    setError("");
    setSimilarMovies([]);

    try {
      let movieDetails = null;
      let tmdbId = movie.id || null;

      // Try TMDB first
      if (tmdbId) {
        const tmdbRes = await fetch(
            `${TMDB_API_URL}/movie/${tmdbId}?append_to_response=credits,release_dates`,
            {
              headers: {
                Authorization: `Bearer ${TMDB_READ_TOKEN}`,
                accept: "application/json",
              },
            }
        );

        const tmdbData = await tmdbRes.json();

        if (tmdbRes.ok) {
          movieDetails = {
            title: tmdbData.title,
            year: tmdbData.release_date?.substring(0, 4) || "N/A",
            poster: tmdbData.poster_path
                ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                : "N/A",
            plot: tmdbData.overview || "N/A",
            director: tmdbData.credits?.crew
                ?.filter((p: any) => p.job === "Director")
                .map((d: any) => d.name)
                .join(", ") || "N/A",
            writer: tmdbData.credits?.crew
                ?.filter((p: any) => p.job === "Screenplay" || p.job === "Writer")
                .map((w: any) => w.name)
                .join(", ") || "N/A",
            actors: tmdbData.credits?.cast
                ?.slice(0, 5)
                .map((c: any) => c.name)
                .join(", ") || "N/A",
            awards: "N/A", // Not available in TMDB
            rating: tmdbData.vote_average ? `${tmdbData.vote_average}/10` : "N/A",
            type: "movie",
            rated: tmdbData.release_dates?.results
                ?.find((r: any) => r.iso_3166_1 === "US")
                ?.release_dates[0]?.certification || "N/A",
            imdbID: tmdbData.imdb_id || movie.imdbID,
            tmdbId
          };

          // Fetch similar movies
          const similarRes = await fetch(
              `${TMDB_API_URL}/movie/${tmdbId}/similar`,
              {
                headers: {
                  Authorization: `Bearer ${TMDB_READ_TOKEN}`,
                  accept: "application/json",
                },
              }
          );

          const similarData = await similarRes.json();
          if (similarRes.ok && similarData.results?.length > 0) {
            setSimilarMovies(similarData.results.slice(0, 6));
          }
        }
      }

      // If TMDB failed or doesn't have enough data, try OMDB
      if (!movieDetails && (movie.imdbID || movie.title)) {
        const omdbRes = await fetch(
            `${OMDB_API_URL}&i=${movie.imdbID || ""}&t=${movie.title || ""}`
        );
        const omdbData = await omdbRes.json();

        if (omdbData.Response === "True") {
          movieDetails = {
            title: omdbData.Title,
            year: omdbData.Year,
            poster: omdbData.Poster,
            plot: omdbData.Plot,
            director: omdbData.Director,
            writer: omdbData.Writer,
            actors: omdbData.Actors,
            awards: omdbData.Awards,
            rating: omdbData.imdbRating,
            type: omdbData.Type,
            rated: omdbData.Rated,
            imdbID: omdbData.imdbID,
            tmdbId: null
          };
        }
      }

      if (movieDetails) {
        setSelectedMovie(movieDetails);
      } else {
        setError("Failed to load movie details.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch movie details.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (loading || !hasMorePopular || isSearching || selectedMovie) return;

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMorePopular) {
        setPopularPage(prev => prev + 1);
      }
    }, { threshold: 1.0 });

    if (lastMovieRef.current) {
      observer.current.observe(lastMovieRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMorePopular, isSearching, selectedMovie]);

  // Fetch popular movies when page changes
  useEffect(() => {
    if (query === "" && !isSearching) {
      fetchPopularMovies(popularPage);
    }
  }, [popularPage, query, isSearching, fetchPopularMovies]);

  // Initial setup
  useEffect(() => {
    searchInputRef.current?.focus();
    fetchPopularMovies(1);
  }, [fetchPopularMovies]);

  const handlePageChange = (newPage: number) => {
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
                  className={`text-lg ${
                      i < starCount ? "text-yellow-400" : "text-gray-700"
                  }`}
              />
          ))}
          <span className="ml-2 text-gray-400">{rating}</span>
        </div>
    );
  };

  const toggleLike = (imdbID: string) => {
    setLikedMovies(prev => ({
      ...prev,
      [imdbID]: !prev[imdbID]
    }));
  };

  const clearSearch = () => {
    setQuery("");
    setMovies([]);
    setIsSearching(false);
    setPopularPage(1);
    fetchPopularMovies(1);
  };

  const applyFilters = () => {
    setPage(1);
    searchMovies(query, 1);
  };

  const clearFilters = () => {
    setFilters({
      year: "",
      rating: "",
      genre: ""
    });
    setPage(1);
    searchMovies(query, 1);
  };

  const closeMovieDetails = () => {
    setSelectedMovie(null);
    setSimilarMovies([]);
    // Restore scroll position after a small delay to allow DOM update
    setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, 10);
  };

  // Handle Enter key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchMovies(query, 1);
    }
  };

  // Generate years from 1900 to current year
  const years = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) =>
      new Date().getFullYear() - i
  );

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
              Movie Explorer
            </h1>
            <p className="text-gray-400">Discover your next favorite movie</p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-12 text-center relative">
            <div className="relative">
              <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Search for movies..."
                  className="w-full px-6 py-4 pl-14 pr-12 bg-gray-800 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg"
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-red-500 rounded-full animate-spin"></div>
                ) : (
                    <FaSearch className="text-xl text-gray-500" />
                )}
              </div>
              {query && (
                  <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <FaTimes />
                  </button>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                  onClick={() => query.trim() && searchMovies(query, 1)}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition"
              >
                Search Movies
              </button>
              <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold flex items-center gap-2"
              >
                <FaFilter /> Filters
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
              <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaFilter /> Filter Movies
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Year</label>
                    <select
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="">All Years</option>
                      {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">Min Rating</label>
                    <select
                        value={filters.rating}
                        onChange={(e) => setFilters({...filters, rating: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="">All Ratings</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(rating => (
                          <option key={rating} value={rating}>{rating}+</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">Genre</label>
                    <select
                        value={filters.genre}
                        onChange={(e) => setFilters({...filters, genre: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="">All Genres</option>
                      {genres.map(genre => (
                          <option key={genre.id} value={genre.id}>{genre.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                  >
                    Clear Filters
                  </button>
                  <button
                      onClick={applyFilters}
                      className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
          )}

          {/* Error */}
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
                    onClick={closeMovieDetails}
                    className="flex items-center text-gray-400 hover:text-white mb-6"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to results
                </button>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    {selectedMovie.poster !== "N/A" ? (
                        <img
                            src={selectedMovie.poster}
                            alt={selectedMovie.title}
                            className="w-full rounded-lg shadow-lg"
                        />
                    ) : (
                        <div className="bg-gray-900 h-96 flex items-center justify-center rounded-lg border border-dashed border-gray-600">
                          <FaFilm className="text-4xl text-gray-600" />
                        </div>
                    )}
                  </div>
                  <div className="md:w-2/3 space-y-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-3xl font-bold">{selectedMovie.title}</h2>
                      <button
                          onClick={() => toggleLike(selectedMovie.imdbID)}
                          className="flex items-center text-red-500 hover:text-red-400 transition"
                          aria-label={likedMovies[selectedMovie.imdbID] ? "Unlike movie" : "Like movie"}
                      >
                        {likedMovies[selectedMovie.imdbID] ? (
                            <FaHeart className="text-2xl" />
                        ) : (
                            <FaRegHeart className="text-2xl" />
                        )}
                        <span className="ml-2 text-sm">
                      {likedMovies[selectedMovie.imdbID] ? "Liked" : "Like"}
                    </span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="bg-red-500 px-3 py-1 rounded-full">{selectedMovie.year}</span>
                      <span className="bg-blue-500 px-3 py-1 rounded-full">{selectedMovie.type}</span>
                      <span className="bg-gray-600 px-3 py-1 rounded-full">{selectedMovie.rated}</span>
                    </div>
                    {renderStars(selectedMovie.rating)}
                    <p className="text-gray-300">{selectedMovie.plot}</p>
                    <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-400">
                      <p><strong>Director:</strong> {selectedMovie.director}</p>
                      <p><strong>Writer:</strong> {selectedMovie.writer}</p>
                      <p><strong>Actors:</strong> {selectedMovie.actors}</p>
                      <p><strong>Awards:</strong> {selectedMovie.awards}</p>
                    </div>
                    {selectedMovie.imdbID && (
                        <a
                            href={`https://www.imdb.com/title/${selectedMovie.imdbID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition"
                        >
                          View on IMDb
                        </a>
                    )}
                  </div>
                </div>

                {/* Similar Movies */}
                {similarMovies.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-2xl font-bold mb-4">🎬 Similar Movies</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {similarMovies.map((movie) => (
                            <div
                                key={movie.id}
                                onClick={() => getMovieDetails(movie)}
                                className="group bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer transition transform hover:scale-105"
                            >
                              {movie.poster_path ? (
                                  <img
                                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                      alt={movie.title}
                                      className="w-full h-48 object-cover"
                                  />
                              ) : (
                                  <div className="h-48 bg-gray-700 flex items-center justify-center">
                                    <FaFilm className="text-2xl text-gray-400" />
                                  </div>
                              )}
                              <div className="p-2">
                                <h3 className="text-xs font-bold line-clamp-2">{movie.title}</h3>
                                <p className="text-xs text-gray-400">
                                  {movie.release_date?.substring(0, 4)}
                                </p>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>
          ) : (
              <>
                {/* Search Results */}
                {isSearching && (
                    <>
                      <h2 className="text-2xl font-semibold mb-6">Search Results for "{query}"</h2>

                      {/* Movie Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {movies.map((movie) => (
                            <div
                                key={movie.id || movie.imdbID}
                                onClick={() => getMovieDetails(movie)}
                                className="group bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl overflow-hidden border border-gray-700 transition transform hover:-translate-y-2 shadow-lg cursor-pointer"
                            >
                              <div className="h-80 overflow-hidden">
                                {movie.poster_path || movie.Poster !== "N/A" ? (
                                    <img
                                        src={
                                          movie.poster_path
                                              ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                              : movie.Poster
                                        }
                                        alt={movie.title || movie.Title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                      <FaFilm className="text-5xl text-gray-600" />
                                    </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="text-lg font-semibold">{movie.title || movie.Title}</h3>
                                <p className="text-sm text-gray-400">
                                  {movie.release_date?.substring(0, 4) || movie.Year}
                                </p>
                              </div>
                            </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
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
                            {[...Array(Math.min(5, totalPages))].map((_, i) => (
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
                                disabled={page >= totalPages}
                                className={`px-4 py-2 rounded-md ${
                                    page >= totalPages
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

                {/* Popular Movies - Infinite Scroll */}
                {!isSearching && (
                    <div className="mb-12">
                      <h2 className="text-2xl font-semibold mb-6">🔥 Popular Movies</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {popularMovies.map((movie, index) => {
                          if (popularMovies.length === index + 1) {
                            return (
                                <div
                                    ref={lastMovieRef}
                                    key={movie.id}
                                    onClick={() => getMovieDetails(movie)}
                                    className="group bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer transition transform hover:scale-105"
                                >
                                  {movie.poster_path ? (
                                      <img
                                          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                          alt={movie.title}
                                          className="w-full h-64 object-cover"
                                      />
                                  ) : (
                                      <div className="h-64 bg-gray-700 flex items-center justify-center">
                                        <FaFilm className="text-3xl text-gray-400" />
                                      </div>
                                  )}
                                  <div className="p-2">
                                    <h3 className="text-sm font-bold line-clamp-2">{movie.title}</h3>
                                    <p className="text-xs text-gray-400">
                                      {movie.release_date?.substring(0, 4)}
                                    </p>
                                  </div>
                                </div>
                            );
                          } else {
                            return (
                                <div
                                    key={movie.id}
                                    onClick={() => getMovieDetails(movie)}
                                    className="group bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer transition transform hover:scale-105"
                                >
                                  {movie.poster_path ? (
                                      <img
                                          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                          alt={movie.title}
                                          className="w-full h-64 object-cover"
                                      />
                                  ) : (
                                      <div className="h-64 bg-gray-700 flex items-center justify-center">
                                        <FaFilm className="text-3xl text-gray-400" />
                                      </div>
                                  )}
                                  <div className="p-2">
                                    <h3 className="text-sm font-bold line-clamp-2">{movie.title}</h3>
                                    <p className="text-xs text-gray-400">
                                      {movie.release_date?.substring(0, 4)}
                                    </p>
                                  </div>
                                </div>
                            );
                          }
                        })}
                      </div>
                      {loading && (
                          <div className="flex justify-center mt-8">
                            <div className="w-10 h-10 border-4 border-gray-400 border-t-red-500 rounded-full animate-spin"></div>
                          </div>
                      )}
                      {!hasMorePopular && !loading && (
                          <div className="text-center mt-8 text-gray-400">
                            You've reached the end of popular movies
                          </div>
                      )}
                    </div>
                )}
              </>
          )}
        </main>
      </div>
  );
}