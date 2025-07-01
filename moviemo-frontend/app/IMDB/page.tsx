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
  FaFilter,
  FaTv,
  FaUserAlt
} from "react-icons/fa";

const TMDB_READ_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmODBhY2MwMDFhZDkzZWMwZDMxNDE2YmEyNGY0OTU0ZSIsIm5iZiI6MTc1MTE5MDExNi4zNTgsInN1YiI6IjY4NjEwYTY0YWJkMmQyZmJlNDkxNWM3YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.LzpqdZIbOZBFXFmzkbDqp5koMa8lt_LKIh-ef53y5uc";
const OMDB_API_KEY = "5be075a5";
const OMDB_API_URL = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;
const TMDB_API_URL = "https://api.themoviedb.org/3";

export default function MovieSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [similarItems, setSimilarItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [popularPage, setPopularPage] = useState(1);
  const [hasMorePopular, setHasMorePopular] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    year: "",
    rating: "",
    genre: "",
    mediaType: "multi" // 'multi', 'movie', 'tv', 'person'
  });
  const [genres, setGenres] = useState<{movie: any[], tv: any[]}>({movie: [], tv: []});
  const [trendingItems, setTrendingItems] = useState<any[]>([]);
  const [currentCollection, setCurrentCollection] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  // Fetch genres for both movies and TV
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieRes, tvRes] = await Promise.all([
          fetch(`${TMDB_API_URL}/genre/movie/list`, {
            headers: {
              Authorization: `Bearer ${TMDB_READ_TOKEN}`,
              accept: "application/json",
            },
          }),
          fetch(`${TMDB_API_URL}/genre/tv/list`, {
            headers: {
              Authorization: `Bearer ${TMDB_READ_TOKEN}`,
              accept: "application/json",
            },
          })
        ]);

        const movieData = await movieRes.json();
        const tvData = await tvRes.json();

        setGenres({
          movie: movieData.genres || [],
          tv: tvData.genres || []
        });
      } catch (error) {
        console.error("Failed to fetch genres", error);
      }
    };

    fetchGenres();
  }, []);

  // Fetch trending items
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${TMDB_API_URL}/trending/all/day`, {
          headers: {
            Authorization: `Bearer ${TMDB_READ_TOKEN}`,
            accept: "application/json",
          },
        });
        const data = await res.json();
        if (data.results) {
          setTrendingItems(data.results.slice(0, 10));
        }
      } catch (error) {
        console.error("Failed to fetch trending items", error);
      }
    };

    fetchTrending();
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

  // Search using TMDB with OMDB fallback
  const searchItems = useCallback(async (searchTerm: string, pageNum = 1) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setSelectedItem(null);
      setError("");
      setIsSearching(false);
      fetchPopularMovies(1);
      return;
    }

    setLoading(true);
    setError("");
    setSelectedItem(null);
    setSimilarItems([]);
    setCurrentCollection(null);
    setIsSearching(true);

    try {
      // TMDB Search
      let url = `${TMDB_API_URL}/search/${filters.mediaType}?query=${encodeURIComponent(searchTerm)}&page=${pageNum}`;

      // For discover functionality (movies and TV only)
      if (filters.mediaType === 'movie' || filters.mediaType === 'tv') {
        const params = [];
        if (filters.year) params.push(`year=${filters.year}`);
        if (filters.rating) params.push(`vote_average.gte=${filters.rating}`);

        if (filters.genre) {
          const genreType = filters.mediaType === 'movie' ? 'movie' : 'tv';
          params.push(`with_genres=${filters.genre}`);
        }

        if (params.length > 0) {
          url = `${TMDB_API_URL}/discover/${filters.mediaType}?include_adult=false&sort_by=popularity.desc&page=${pageNum}&query=${encodeURIComponent(searchTerm)}&${params.join('&')}`;
        }
      }

      const tmdbRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TMDB_READ_TOKEN}`,
          accept: "application/json",
        },
      });

      const tmdbData = await tmdbRes.json();

      if (tmdbRes.ok && tmdbData.results?.length > 0) {
        setResults(tmdbData.results);
        setTotalPages(tmdbData.total_pages || 0);
        return;
      }

      // OMDB Fallback (only for movies)
      if (filters.mediaType === 'movie' || filters.mediaType === 'multi') {
        const omdbRes = await fetch(
            `${OMDB_API_URL}&s=${encodeURIComponent(searchTerm)}&page=${pageNum}`
        );
        const omdbData = await omdbRes.json();

        if (omdbData.Response === "True") {
          setResults(omdbData.Search);
          setTotalPages(Math.ceil(parseInt(omdbData.totalResults) / 10) || 0);
        } else {
          setResults([]);
          setError(omdbData.Error || "No results found.");
        }
      } else {
        setResults([]);
        setError("No results found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch items. Check your internet connection.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get item details
  const getItemDetails = useCallback(async (item: any) => {
    scrollPositionRef.current = window.scrollY;
    setLoading(true);
    setError("");
    setSimilarItems([]);
    setCurrentCollection(null);

    try {
      let itemDetails = null;
      let tmdbId = item.id || null;
      const mediaType = item.media_type || filters.mediaType;

      // TMDB Details
      if (tmdbId && mediaType !== 'person') {
        let detailsUrl = `${TMDB_API_URL}/${mediaType}/${tmdbId}?append_to_response=`;

        if (mediaType === 'movie') {
          detailsUrl += 'credits,release_dates,videos,similar,collection';
        } else if (mediaType === 'tv') {
          detailsUrl += 'aggregate_credits,content_ratings,similar,videos,seasons';
        }

        const detailsRes = await fetch(detailsUrl, {
          headers: {
            Authorization: `Bearer ${TMDB_READ_TOKEN}`,
            accept: "application/json",
          },
        });

        const detailsData = await detailsRes.json();

        if (detailsRes.ok) {
          // Process based on media type
          if (mediaType === 'movie') {
            itemDetails = processMovieDetails(detailsData);

            // Fetch collection if available
            if (detailsData.belongs_to_collection) {
              const collectionRes = await fetch(
                  `${TMDB_API_URL}/collection/${detailsData.belongs_to_collection.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${TMDB_READ_TOKEN}`,
                      accept: "application/json",
                    },
                  }
              );
              const collectionData = await collectionRes.json();
              setCurrentCollection(collectionData);
            }

            setSimilarItems(detailsData.similar?.results || []);
          }
          else if (mediaType === 'tv') {
            itemDetails = processTVDetails(detailsData);
            setSimilarItems(detailsData.similar?.results || []);
          }
        }
      }
      // Person details
      else if (mediaType === 'person' && tmdbId) {
        const personRes = await fetch(
            `${TMDB_API_URL}/person/${tmdbId}?append_to_response=combined_credits`,
            {
              headers: {
                Authorization: `Bearer ${TMDB_READ_TOKEN}`,
                accept: "application/json",
              },
            }
        );

        const personData = await personRes.json();
        if (personRes.ok) {
          itemDetails = processPersonDetails(personData);
        }
      }

      // OMDB Fallback for movies
      if (!itemDetails && (mediaType === 'movie' || mediaType === 'multi')) {
        const omdbRes = await fetch(
            `${OMDB_API_URL}&i=${item.imdbID || ""}&t=${item.title || ""}`
        );
        const omdbData = await omdbRes.json();

        if (omdbData.Response === "True") {
          itemDetails = {
            ...omdbData,
            media_type: 'movie',
            type: 'movie'
          };
        }
      }

      if (itemDetails) {
        setSelectedItem(itemDetails);
      } else {
        setError("Failed to load details.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch details.");
    } finally {
      setLoading(false);
    }
  }, [filters.mediaType]);

  // Process movie details
  const processMovieDetails = (data: any) => {
    return {
      id: data.id,
      title: data.title,
      year: data.release_date?.substring(0, 4) || "N/A",
      poster: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : "N/A",
      backdrop: data.backdrop_path
          ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
          : null,
      plot: data.overview || "N/A",
      director: data.credits?.crew
          ?.filter((p: any) => p.job === "Director")
          .map((d: any) => d.name)
          .join(", ") || "N/A",
      writer: data.credits?.crew
          ?.filter((p: any) => p.job === "Screenplay" || p.job === "Writer")
          .map((w: any) => w.name)
          .join(", ") || "N/A",
      actors: data.credits?.cast
          ?.slice(0, 5)
          .map((c: any) => c.name)
          .join(", ") || "N/A",
      rating: data.vote_average ? `${data.vote_average}/10` : "N/A",
      type: "movie",
      media_type: "movie",
      rated: data.release_dates?.results
          ?.find((r: any) => r.iso_3166_1 === "US")
          ?.release_dates[0]?.certification || "N/A",
      imdbID: data.imdb_id,
      runtime: data.runtime ? `${data.runtime} mins` : "N/A",
      genres: data.genres?.map((g: any) => g.name).join(", ") || "N/A",
      videos: data.videos?.results?.filter(
          (v: any) => v.site === "YouTube" && v.type === "Trailer"
      ) || [],
      production_companies: data.production_companies?.map(
          (c: any) => c.name
      ) || [],
      reviews: [], // Reviews would require additional API call
    };
  };

  // Process TV show details
  const processTVDetails = (data: any) => {
    return {
      id: data.id,
      title: data.name,
      year: data.first_air_date?.substring(0, 4) || "N/A",
      poster: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : "N/A",
      backdrop: data.backdrop_path
          ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
          : null,
      plot: data.overview || "N/A",
      creator: data.created_by?.map((c: any) => c.name).join(", ") || "N/A",
      actors: data.aggregate_credits?.cast
          ?.slice(0, 5)
          .map((c: any) => c.name)
          .join(", ") || "N/A",
      rating: data.vote_average ? `${data.vote_average}/10` : "N/A",
      type: "tv",
      media_type: "tv",
      seasons: data.number_of_seasons || 0,
      episodes: data.number_of_episodes || 0,
      status: data.status || "N/A",
      networks: data.networks?.map((n: any) => n.name).join(", ") || "N/A",
      runtime: data.episode_run_time?.[0]
          ? `${data.episode_run_time[0]} mins` : "N/A",
      genres: data.genres?.map((g: any) => g.name).join(", ") || "N/A",
      videos: data.videos?.results?.filter(
          (v: any) => v.site === "YouTube" && v.type === "Trailer"
      ) || [],
      seasonsData: data.seasons || [],
      production_companies: data.production_companies?.map(
          (c: any) => c.name
      ) || [],
    };
  };

  // Process person details
  const processPersonDetails = (data: any) => {
    return {
      id: data.id,
      name: data.name,
      biography: data.biography || "N/A",
      birthday: data.birthday || "N/A",
      deathday: data.deathday || "N/A",
      place_of_birth: data.place_of_birth || "N/A",
      profile_path: data.profile_path
          ? `https://image.tmdb.org/t/p/w500${data.profile_path}`
          : null,
      media_type: "person",
      known_for_department: data.known_for_department || "N/A",
      combined_credits: data.combined_credits?.cast || [],
      popularity: data.popularity || 0,
    };
  };

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (loading || !hasMorePopular || isSearching || selectedItem) return;

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMorePopular) {
        setPopularPage(prev => prev + 1);
      }
    }, { threshold: 1.0 });

    if (lastItemRef.current) {
      observer.current.observe(lastItemRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMorePopular, isSearching, selectedItem]);

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
      searchItems(query, newPage);
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

  const toggleLike = (id: string) => {
    setLikedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsSearching(false);
    setPopularPage(1);
    fetchPopularMovies(1);
  };

  const applyFilters = () => {
    setPage(1);
    searchItems(query, 1);
  };

  const clearFilters = () => {
    setFilters({
      year: "",
      rating: "",
      genre: "",
      mediaType: "multi"
    });
    setPage(1);
    searchItems(query, 1);
  };

  const closeItemDetails = () => {
    setSelectedItem(null);
    setSimilarItems([]);
    setCurrentCollection(null);
    setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, 10);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchItems(query, 1);
    }
  };

  const years = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) =>
      new Date().getFullYear() - i
  );

  // Render item based on its type
  const renderItem = (item: any, ref?: React.Ref<HTMLDivElement>) => {
    const mediaType = item.media_type || filters.mediaType;
    const isPerson = mediaType === 'person';
    const isTV = mediaType === 'tv';

    let title, year, imagePath;

    if (isPerson) {
      title = item.name;
      year = item.known_for_department;
      imagePath = item.profile_path;
    } else {
      title = item.title || item.name;
      year = (item.release_date || item.first_air_date)?.substring(0, 4);
      imagePath = item.poster_path;
    }

    return (
        <div
            ref={ref}
            onClick={() => getItemDetails(item)}
            className={`group bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer transition transform hover:scale-105 ${isPerson ? 'h-full' : ''}`}
        >
          {imagePath ? (
              <img
                  src={`https://image.tmdb.org/t/p/w300${imagePath}`}
                  alt={title}
                  className={`w-full ${isPerson ? 'h-64 object-cover' : 'h-64 object-cover'}`}
              />
          ) : (
              <div className={`${isPerson ? 'h-64' : 'h-64'} bg-gray-700 flex items-center justify-center`}>
                {isPerson ? (
                    <FaUserAlt className="text-3xl text-gray-400" />
                ) : isTV ? (
                    <FaTv className="text-3xl text-gray-400" />
                ) : (
                    <FaFilm className="text-3xl text-gray-400" />
                )}
              </div>
          )}
          <div className="p-2">
            <h3 className="text-sm font-bold line-clamp-2">{title}</h3>
            <p className="text-xs text-gray-400">
              {year}
              {isTV && ` • ${item.media_type === 'tv' ? 'TV Show' : ''}`}
              {isPerson && ` • ${item.known_for_department}`}
            </p>
          </div>
        </div>
    );
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
              Media Explorer
            </h1>
            <p className="text-gray-400">Discover movies, TV shows, and celebrities</p>
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
                  placeholder="Search for movies, shows, people..."
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
                  onClick={() => query.trim() && searchItems(query, 1)}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition"
              >
                Search
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
                  <FaFilter /> Filter Results
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Media Type</label>
                    <select
                        value={filters.mediaType}
                        onChange={(e) => setFilters({...filters, mediaType: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="multi">All</option>
                      <option value="movie">Movies</option>
                      <option value="tv">TV Shows</option>
                      <option value="person">People</option>
                    </select>
                  </div>

                  {filters.mediaType !== 'person' && (
                      <>
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
                            {filters.mediaType === 'movie'
                                ? genres.movie.map(genre => (
                                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                                ))
                                : filters.mediaType === 'tv'
                                    ? genres.tv.map(genre => (
                                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                                    ))
                                    : null}
                          </select>
                        </div>
                      </>
                  )}
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

          {/* Trending Section */}
          {!isSearching && !selectedItem && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">🔥 Trending Today</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {trendingItems.map((item) => renderItem(item))}
                </div>
              </div>
          )}

          {/* Item Detail */}
          {selectedItem ? (
              <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
                <button
                    onClick={closeItemDetails}
                    className="flex items-center text-gray-400 hover:text-white mb-6"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to results
                </button>

                {selectedItem.media_type === 'movie' && (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        {selectedItem.poster !== "N/A" ? (
                            <img
                                src={selectedItem.poster}
                                alt={selectedItem.title}
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
                          <h2 className="text-3xl font-bold">{selectedItem.title}</h2>
                          <button
                              onClick={() => toggleLike(selectedItem.id)}
                              className="flex items-center text-red-500 hover:text-red-400 transition"
                              aria-label={likedItems[selectedItem.id] ? "Unlike" : "Like"}
                          >
                            {likedItems[selectedItem.id] ? (
                                <FaHeart className="text-2xl" />
                            ) : (
                                <FaRegHeart className="text-2xl" />
                            )}
                            <span className="ml-2 text-sm">
                        {likedItems[selectedItem.id] ? "Liked" : "Like"}
                      </span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="bg-red-500 px-3 py-1 rounded-full">{selectedItem.year}</span>
                          <span className="bg-blue-500 px-3 py-1 rounded-full">Movie</span>
                          <span className="bg-gray-600 px-3 py-1 rounded-full">{selectedItem.rated}</span>
                          <span className="bg-purple-500 px-3 py-1 rounded-full">{selectedItem.runtime}</span>
                        </div>
                        {renderStars(selectedItem.rating)}
                        <p className="text-gray-300">{selectedItem.plot}</p>
                        <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-400">
                          <p><strong>Director:</strong> {selectedItem.director}</p>
                          <p><strong>Writer:</strong> {selectedItem.writer}</p>
                          <p><strong>Actors:</strong> {selectedItem.actors}</p>
                          <p><strong>Genres:</strong> {selectedItem.genres}</p>
                          <p><strong>Production:</strong> {selectedItem.production_companies.join(', ')}</p>
                        </div>

                        {/* Videos */}
                        {selectedItem.videos.length > 0 && (
                            <div className="mt-4">
                              <h3 className="text-xl font-bold mb-2">Trailers</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedItem.videos.slice(0, 2).map((video: any) => (
                                    <div key={video.key} className="aspect-video">
                                      <iframe
                                          src={`https://www.youtube.com/embed/${video.key}`}
                                          className="w-full h-full rounded-lg"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                      ></iframe>
                                    </div>
                                ))}
                              </div>
                            </div>
                        )}

                        {selectedItem.imdbID && (
                            <a
                                href={`https://www.imdb.com/title/${selectedItem.imdbID}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition"
                            >
                              View on IMDb
                            </a>
                        )}
                      </div>
                    </div>
                )}

                {selectedItem.media_type === 'tv' && (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        {selectedItem.poster !== "N/A" ? (
                            <img
                                src={selectedItem.poster}
                                alt={selectedItem.title}
                                className="w-full rounded-lg shadow-lg"
                            />
                        ) : (
                            <div className="bg-gray-900 h-96 flex items-center justify-center rounded-lg border border-dashed border-gray-600">
                              <FaTv className="text-4xl text-gray-600" />
                            </div>
                        )}
                      </div>
                      <div className="md:w-2/3 space-y-4">
                        <div className="flex justify-between items-start">
                          <h2 className="text-3xl font-bold">{selectedItem.title}</h2>
                          <button
                              onClick={() => toggleLike(selectedItem.id)}
                              className="flex items-center text-red-500 hover:text-red-400 transition"
                              aria-label={likedItems[selectedItem.id] ? "Unlike" : "Like"}
                          >
                            {likedItems[selectedItem.id] ? (
                                <FaHeart className="text-2xl" />
                            ) : (
                                <FaRegHeart className="text-2xl" />
                            )}
                            <span className="ml-2 text-sm">
                        {likedItems[selectedItem.id] ? "Liked" : "Like"}
                      </span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="bg-red-500 px-3 py-1 rounded-full">{selectedItem.year}</span>
                          <span className="bg-blue-500 px-3 py-1 rounded-full">TV Show</span>
                          <span className="bg-purple-500 px-3 py-1 rounded-full">{selectedItem.runtime}</span>
                          <span className="bg-green-500 px-3 py-1 rounded-full">{selectedItem.seasons} seasons</span>
                        </div>
                        {renderStars(selectedItem.rating)}
                        <p className="text-gray-300">{selectedItem.plot}</p>
                        <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-400">
                          <p><strong>Creator:</strong> {selectedItem.creator}</p>
                          <p><strong>Actors:</strong> {selectedItem.actors}</p>
                          <p><strong>Networks:</strong> {selectedItem.networks}</p>
                          <p><strong>Status:</strong> {selectedItem.status}</p>
                          <p><strong>Genres:</strong> {selectedItem.genres}</p>
                          <p><strong>Production:</strong> {selectedItem.production_companies.join(', ')}</p>
                        </div>

                        {/* Videos */}
                        {selectedItem.videos.length > 0 && (
                            <div className="mt-4">
                              <h3 className="text-xl font-bold mb-2">Trailers</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedItem.videos.slice(0, 2).map((video: any) => (
                                    <div key={video.key} className="aspect-video">
                                      <iframe
                                          src={`https://www.youtube.com/embed/${video.key}`}
                                          className="w-full h-full rounded-lg"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                      ></iframe>
                                    </div>
                                ))}
                              </div>
                            </div>
                        )}
                      </div>
                    </div>
                )}

                {selectedItem.media_type === 'person' && (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        {selectedItem.profile_path ? (
                            <img
                                src={selectedItem.profile_path}
                                alt={selectedItem.name}
                                className="w-full rounded-lg shadow-lg"
                            />
                        ) : (
                            <div className="bg-gray-900 h-96 flex items-center justify-center rounded-lg border border-dashed border-gray-600">
                              <FaUserAlt className="text-4xl text-gray-600" />
                            </div>
                        )}
                      </div>
                      <div className="md:w-2/3 space-y-4">
                        <div className="flex justify-between items-start">
                          <h2 className="text-3xl font-bold">{selectedItem.name}</h2>
                          <button
                              onClick={() => toggleLike(selectedItem.id)}
                              className="flex items-center text-red-500 hover:text-red-400 transition"
                              aria-label={likedItems[selectedItem.id] ? "Unlike" : "Like"}
                          >
                            {likedItems[selectedItem.id] ? (
                                <FaHeart className="text-2xl" />
                            ) : (
                                <FaRegHeart className="text-2xl" />
                            )}
                            <span className="ml-2 text-sm">
                        {likedItems[selectedItem.id] ? "Liked" : "Like"}
                      </span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="bg-red-500 px-3 py-1 rounded-full">{selectedItem.known_for_department}</span>
                          {selectedItem.birthday && (
                              <span className="bg-blue-500 px-3 py-1 rounded-full">
                        Born: {selectedItem.birthday}
                      </span>
                          )}
                          {selectedItem.deathday && (
                              <span className="bg-gray-600 px-3 py-1 rounded-full">
                        Died: {selectedItem.deathday}
                      </span>
                          )}
                        </div>
                        <p className="text-gray-300">{selectedItem.biography}</p>
                        <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-400">
                          <p><strong>Place of Birth:</strong> {selectedItem.place_of_birth}</p>
                          <p><strong>Popularity:</strong> {selectedItem.popularity.toFixed(1)}</p>
                        </div>

                        {/* Filmography */}
                        {selectedItem.combined_credits.length > 0 && (
                            <div className="mt-4">
                              <h3 className="text-xl font-bold mb-2">Known For</h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {selectedItem.combined_credits
                                    .sort((a: any, b: any) => b.popularity - a.popularity)
                                    .slice(0, 12)
                                    .map((credit: any) => (
                                        <div
                                            key={`${credit.id}-${credit.media_type}`}
                                            className="group bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer transition transform hover:scale-105"
                                        >
                                          {credit.poster_path || credit.profile_path ? (
                                              <img
                                                  src={`https://image.tmdb.org/t/p/w200${credit.poster_path || credit.profile_path}`}
                                                  alt={credit.title || credit.name}
                                                  className="w-full h-48 object-cover"
                                              />
                                          ) : (
                                              <div className="h-48 bg-gray-700 flex items-center justify-center">
                                                {credit.media_type === 'movie' ? (
                                                    <FaFilm className="text-2xl text-gray-400" />
                                                ) : credit.media_type === 'tv' ? (
                                                    <FaTv className="text-2xl text-gray-400" />
                                                ) : (
                                                    <FaUserAlt className="text-2xl text-gray-400" />
                                                )}
                                              </div>
                                          )}
                                          <div className="p-2">
                                            <h3 className="text-xs font-bold line-clamp-2">{credit.title || credit.name}</h3>
                                            <p className="text-xs text-gray-400">
                                              {credit.media_type === 'movie' ? 'Movie' :
                                                  credit.media_type === 'tv' ? 'TV Show' : 'Person'}
                                            </p>
                                          </div>
                                        </div>
                                    ))}
                              </div>
                            </div>
                        )}
                      </div>
                    </div>
                )}

                {/* Collection */}
                {currentCollection && (
                    <div className="mt-12">
                      <h3 className="text-2xl font-bold mb-4">🎬 {currentCollection.name}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {currentCollection.parts.map((movie: any) => renderItem(movie))}
                      </div>
                    </div>
                )}

                {/* Similar Items */}
                {similarItems.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-2xl font-bold mb-4">
                        {selectedItem.media_type === 'movie' ? '🎬 Similar Movies' :
                            selectedItem.media_type === 'tv' ? '📺 Similar TV Shows' :
                                '🌟 Similar People'}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {similarItems.map((item) => renderItem(item))}
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

                      {/* Results Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
                        {results.map((item, index) => {
                          if (results.length === index + 1) {
                            return (
                                <div ref={lastItemRef} key={item.id || item.imdbID}>
                                  {renderItem(item)}
                                </div>
                            );
                          } else {
                            return renderItem(item);
                          }
                        })}
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {popularMovies.map((movie, index) => {
                          if (popularMovies.length === index + 1) {
                            return (
                                <div ref={lastItemRef} key={movie.id}>
                                  {renderItem({...movie, media_type: 'movie'})}
                                </div>
                            );
                          } else {
                            return renderItem({...movie, media_type: 'movie'});
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