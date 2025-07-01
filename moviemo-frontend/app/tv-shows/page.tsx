"use client";
import { useState, useEffect, useRef } from "react";
import {
    FaSearch,
    FaStar,
    FaFilter,
    FaTv,
    FaPlay,
    FaHeart,
    FaClock,
    FaArrowLeft
} from "react-icons/fa";

// API Configuration
const TMDB_READ_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmODBhY2MwMDFhZDkzZWMwZDMxNDE2YmEyNGY0OTU0ZSIsIm5iZiI6MTc1MTE5MDExNi4zNTgsInN1YiI6IjY4NjEwYTY0YWJkMmQyZmJlNDkxNWM3YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.LzpqdZIbOZBFXFmzkbDqp5koMa8lt_LKIh-ef53y5uc";
const OMDB_API_KEY = "5be075a5";
const OMDB_API_URL = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;
const TMDB_API_URL = "https://api.themoviedb.org/3";

export default function TVShows() {
    // State Management
    const [tvShows, setTVShows] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        year: "",
        rating: "",
        genre: "",
        sort: "popularity.desc",
        searchTerm: ""
    });
    const [genres, setGenres] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const [manualEpisode, setManualEpisode] = useState<number | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [streamUrl, setStreamUrl] = useState("");
    const [streamTitle, setStreamTitle] = useState("");
    const [imdbID, setImdbID] = useState<string | null>(null);
    const [streamLoading, setStreamLoading] = useState(false);

    // Refs
    const observer = useRef<IntersectionObserver | null>(null);
    const lastTVShowElementRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch genres
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await fetch(`${TMDB_API_URL}/genre/tv/list`, {
                    headers: {
                        Authorization: `Bearer ${TMDB_READ_TOKEN}`,
                        accept: "application/json",
                    },
                });
                const data = await res.json();
                setGenres(data.genres || []);
            } catch (err) {
                console.error("Failed to fetch genres", err);
            }
        };
        fetchGenres();
    }, []);

    // Fetch trending TV shows
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch(`${TMDB_API_URL}/trending/tv/day`, {
                    headers: {
                        Authorization: `Bearer ${TMDB_READ_TOKEN}`,
                        accept: "application/json",
                    },
                });
                const data = await res.json();
                setTrending(data.results.slice(0, 10));
            } catch (err) {
                console.error("Failed to fetch trending TV shows", err);
            }
        };
        fetchTrending();
    }, []);

    // Fetch TV shows
    const fetchTVShows = async (pageNum = 1, reset = false) => {
        if ((pageNum === 1 && !reset) || pageNum === 1 && filters.searchTerm) setLoading(true);
        else setLoadingMore(true);
        setError("");

        try {
            let url = `${TMDB_API_URL}/discover/tv?include_adult=false&sort_by=${filters.sort}&page=${pageNum}`;
            if (filters.year) url += `&first_air_date_year=${filters.year}`;
            if (filters.rating) url += `&vote_average.gte=${filters.rating}`;
            if (filters.genre) url += `&with_genres=${filters.genre}`;

            // Handle search
            if (filters.searchTerm) {
                url = `${TMDB_API_URL}/search/tv?query=${encodeURIComponent(filters.searchTerm)}&page=${pageNum}`;
            }

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${TMDB_READ_TOKEN}`,
                    accept: "application/json",
                },
            });
            const data = await res.json();

            if (data.results) {
                setTVShows((prev) =>
                    pageNum === 1 ? [...data.results] : [...prev, ...data.results]
                );
                setHasMore(pageNum < data.total_pages);
            }
        } catch (err) {
            console.error("Failed to fetch TV shows", err);
            setError("Failed to load TV shows. Please try again later.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Handle search input changes with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout
        searchTimeoutRef.current = setTimeout(() => {
            setFilters(prev => ({...prev, searchTerm: value}));
            // Reset to first page when search changes
            if (value !== filters.searchTerm) {
                setPage(1);
            }
        }, 500); // 500ms delay
    };

    useEffect(() => {
        fetchTVShows(1, true);

        // Cleanup timeout on unmount
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [filters]);

    // Infinite scroll
    useEffect(() => {
        if (loading || !hasMore || filters.searchTerm) return;

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prev => prev + 1);
            }
        }, { threshold: 0.5 });

        if (lastTVShowElementRef.current) {
            observer.current.observe(lastTVShowElementRef.current);
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [loading, hasMore]);

    useEffect(() => {
        if (page > 1 && !filters.searchTerm) fetchTVShows(page);
    }, [page]);

    // Get TV show details
    const getTVShowDetails = async (item: any) => {
        try {
            const detailsRes = await fetch(
                `${TMDB_API_URL}/tv/${item.id}?append_to_response=seasons,videos,similar`, {
                    headers: {
                        Authorization: `Bearer ${TMDB_READ_TOKEN}`,
                        accept: "application/json",
                    },
                }
            );
            const detailsData = await detailsRes.json();

            // Get IMDb ID from TMDB first
            let currentImdbID = detailsData.imdb_id;

            // If not available, fallback to OMDB
            if (!currentImdbID) {
                const omdbRes = await fetch(
                    `${OMDB_API_URL}&t=${encodeURIComponent(item.name)}`
                );
                const omdbData = await omdbRes.json();
                currentImdbID = omdbData.imdbID || null;
            }

            setSelectedItem({
                ...detailsData,
                media_type: "tv",
                imdb_id: currentImdbID
            });
            setImdbID(currentImdbID);
        } catch (err) {
            console.error("Failed to fetch TV show details", err);
            setError("Failed to load show details");
        }
    };

    // Handle streaming URL
    const fetchStreamingUrl = async (
        item: any,
        seasonNumber: number,
        episodeNumber: number
    ) => {
        if (!seasonNumber || !episodeNumber) {
            alert("Please select a season and enter an episode number");
            return;
        }
        setStreamLoading(true);
        try {
            const seasonData = item.seasons.find(
                (s: any) => s.season_number === seasonNumber
            );

            // Validate episode number
            if (seasonData && episodeNumber > seasonData.episode_count) {
                alert(`Episode must be between 1 and ${seasonData.episode_count}`);
                return;
            }

            // Construct URL
            const watchUrl = imdbID
                ? `https://111movies.com/tv/${imdbID}/${seasonNumber}/${episodeNumber}`
                : `https://111movies.com/tv/${item.id}/${seasonNumber}/${episodeNumber}`;

            setStreamTitle(`${item.name} S${seasonNumber.toString().padStart(2, '0')}E${episodeNumber.toString().padStart(2, '0')}`);
            setStreamUrl(watchUrl);
            setShowPlayer(true);
        } catch (error) {
            console.error("Streaming error:", error);
            alert("Failed to load stream. Try different numbers");
        } finally {
            setStreamLoading(false);
        }
    };

    // Render stars
    const renderStars = (rating: string) => {
        if (!rating) return null;
        const num = parseFloat(rating);
        const starCount = Math.round(num / 2);
        return (
            <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                    <FaStar
                        key={i}
                        className={`text-xs ${
                            i < starCount ? "text-yellow-400" : "text-gray-700"
                        }`}
                    />
                ))}
                <span className="ml-1 text-gray-400 text-xs">{rating}</span>
            </div>
        );
    };

    // Format year
    const formatYear = (date: string) => date?.substring(0, 4) || "N/A";

    // Streaming Player Modal
    const StreamPlayer = () => (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 p-6 rounded-xl w-full max-w-4xl">
                {/* Header with Back Button */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                setShowPlayer(false);
                                setStreamUrl("");
                                setStreamTitle("");
                            }}
                            className="text-gray-400 hover:text-white mr-4 flex items-center transition-colors duration-300"
                            aria-label="Back to details"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back
                        </button>
                        <h3 className="text-xl font-bold text-white truncate max-w-[70%]">{streamTitle}</h3>
                    </div>
                    <button
                        onClick={() => {
                            setShowPlayer(false);
                            setStreamUrl("");
                            setStreamTitle("");
                        }}
                        className="text-gray-400 hover:text-white text-2xl transition-colors duration-300"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {/* Video Player */}
                <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden bg-gray-800">
                    {streamUrl ? (
                        <iframe
                            src={streamUrl}
                            title={`TV Show - ${streamTitle}`}
                            className="absolute top-0 left-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                        </div>
                    )}
                </div>

                {/* Disclaimer */}
                <div className="p-4 mt-4 text-sm text-gray-400 bg-gray-800 rounded-lg">
                    <p>Streaming via MovieMo • Content provided by third-party services</p>
                    <p className="mt-2 text-xs">
                        <strong>Disclaimer:</strong> MovieMo is a content aggregator and does not host any videos. Use at your own discretion.
                    </p>
                </div>
            </div>
        </div>
    );

    // TV Show Details Modal
    const ShowDetails = () => (
        <div className="fixed inset-0 bg-black/90 z-40 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6">
                {/* Back Button */}
                <button
                    onClick={() => {
                        setSelectedItem(null);
                        setSelectedSeason(null);
                        setManualEpisode(null);
                        setStreamUrl("");
                        setStreamTitle("");
                    }}
                    className="mb-6 flex items-center text-gray-300 hover:text-white transition-colors duration-300 text-sm bg-gray-800 px-4 py-2 rounded-full shadow-md"
                    aria-label="Back to results"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Results
                </button>

                {/* TV Show Details Card */}
                <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 rounded-xl shadow-2xl border border-gray-700">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Poster */}
                        <div className="lg:w-1/3 flex-shrink-0">
                            {selectedItem.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`}
                                    alt={selectedItem.name}
                                    className="w-full h-auto rounded-lg shadow-lg object-cover transition-transform hover:scale-[1.02]"
                                />
                            ) : (
                                <div className="h-80 w-full bg-gray-700 flex items-center justify-center rounded-lg shadow-inner">
                                    <FaTv className="text-5xl text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="lg:w-2/3 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div>
                                    <h2 className="text-3xl font-extrabold mb-2">{selectedItem.name}</h2>
                                    <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-red-500 text-xs px-3 py-1 rounded-full">
                      {formatYear(selectedItem.first_air_date)}
                    </span>
                                        <span className="bg-blue-500 text-xs px-3 py-1 rounded-full">TV Show</span>
                                        <span className="bg-purple-500 text-xs px-3 py-1 rounded-full">
                      {selectedItem.number_of_seasons} Seasons
                    </span>
                                        <span className="bg-green-500 text-xs px-3 py-1 rounded-full">
                      {selectedItem.episode_run_time[0] ? `${selectedItem.episode_run_time[0]} mins` : "N/A"}
                    </span>
                                    </div>
                                </div>
                                <button className="text-red-500 hover:text-red-400 transition-colors self-start">
                                    <FaHeart className="text-2xl" />
                                </button>
                            </div>

                            {/* Rating Stars */}
                            {renderStars(selectedItem.vote_average.toFixed(1))}

                            {/* Overview */}
                            <p className="text-gray-300 text-sm leading-relaxed mt-2">
                                {selectedItem.overview || "No description available."}
                            </p>

                            {/* Additional Info */}
                            <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-400 mt-4">
                                <p><strong className="text-gray-200">Creator:</strong> {selectedItem.created_by?.[0]?.name || "N/A"}</p>
                                <p><strong className="text-gray-200">Status:</strong> {selectedItem.status || "N/A"}</p>
                                <p><strong className="text-gray-200">Network:</strong> {selectedItem.networks?.[0]?.name || "N/A"}</p>
                                <p><strong className="text-gray-200">Genres:</strong> {selectedItem.genres.map((g: any) => g.name).join(', ') || "N/A"}</p>
                            </div>

                            {/* Watch Section */}
                            <div className="mt-6 bg-gray-800 p-5 rounded-xl border border-gray-700">
                                <h3 className="text-xl font-bold mb-4 flex items-center">
                                    <FaPlay className="text-green-500 mr-2" /> Watch Series
                                </h3>
                                <div className="space-y-4">
                                    {/* Season Selector */}
                                    <div>
                                        <label className="block text-gray-300 mb-2">Select Season:</label>
                                        <select
                                            onChange={(e) => {
                                                const season = parseInt(e.target.value);
                                                setSelectedSeason(season);
                                                setManualEpisode(1); // reset to first episode
                                            }}
                                            value={selectedSeason || ""}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        >
                                            <option value="">-- Select Season --</option>
                                            {selectedItem.seasons.map((season: any) => (
                                                <option key={season.id} value={season.season_number}>
                                                    {season.name} ({season.episode_count} episodes)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Episode Dropdown */}
                                    {selectedSeason !== null && (
                                        <div>
                                            <label className="block text-gray-300 mb-2">Select Episode:</label>
                                            <select
                                                onChange={(e) => setManualEpisode(parseInt(e.target.value))}
                                                value={manualEpisode || ""}
                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                            >
                                                <option value="">-- Select Episode --</option>
                                                {Array.from(
                                                    { length: selectedItem.seasons.find((s: any) => s.season_number === selectedSeason)?.episode_count || 0 },
                                                    (_, i) => (
                                                        <option key={i + 1} value={i + 1}>
                                                            Episode {i + 1}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                    )}

                                    {/* Watch Button */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() =>
                                                fetchStreamingUrl(selectedItem, selectedSeason!, manualEpisode!)
                                            }
                                            disabled={!selectedSeason || !manualEpisode}
                                            className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition-all ${
                                                selectedSeason && manualEpisode
                                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/30"
                                                    : "bg-gray-600 cursor-not-allowed opacity-60"
                                            }`}
                                        >
                                            Watch Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            {/* Streaming Player */}
            {showPlayer && <StreamPlayer />}

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                        TV Shows
                    </h1>
                    <p className="text-gray-400 text-sm">Discover the best TV series and shows</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search TV shows..."
                            onChange={handleSearchChange}
                            defaultValue={filters.searchTerm}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="absolute left-3 top-3 text-gray-400">
                            <FaSearch />
                        </div>
                    </div>
                </div>

                {/* Trending Section */}
                <div className="mb-10">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 w-2 h-6 rounded-full mr-2"></span>
                        Trending Today
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {trending.map((item) => (
                            <div
                                key={item.id}
                                className="bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform duration-300 group"
                                onClick={() => getTVShowDetails(item)}
                            >
                                <div className="relative pb-[150%]">
                                    {item.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                            alt={item.name}
                                            className="absolute top-0 left-0 w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                                            <FaTv className="text-3xl text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                                        <div className="w-full">
                                            <h3 className="text-sm font-bold line-clamp-2">{item.name}</h3>
                                            <div className="flex justify-between text-xs text-gray-300 mt-1">
                                                <span>{formatYear(item.first_air_date)}</span>
                                                <div className="flex items-center">
                                                    <FaStar className="text-yellow-400 text-xs mr-1" />
                                                    <span>{item.vote_average}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 bg-gray-800 p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center">
                            <FaFilter className="mr-2 text-purple-500" />
                            Filters
                        </h2>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-gray-400 hover:text-white transition-colors flex items-center text-sm"
                        >
                            {showFilters ? (
                                <>
                                    Hide <span className="hidden sm:inline ml-1">Filters</span>
                                </>
                            ) : (
                                <>
                                    Show <span className="hidden sm:inline ml-1">Filters</span>
                                </>
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-gray-300 mb-1 text-sm">Year</label>
                                <select
                                    value={filters.year}
                                    onChange={(e) => setFilters({...filters, year: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                                >
                                    <option value="">All Years</option>
                                    {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => (
                                        <option key={i} value={new Date().getFullYear() - i}>
                                            {new Date().getFullYear() - i}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-1 text-sm">Min Rating</label>
                                <select
                                    value={filters.rating}
                                    onChange={(e) => setFilters({...filters, rating: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                                >
                                    <option value="">All Ratings</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(rating => (
                                        <option key={rating} value={rating}>{rating}+</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-1 text-sm">Genre</label>
                                <select
                                    value={filters.genre}
                                    onChange={(e) => setFilters({...filters, genre: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                                >
                                    <option value="">All Genres</option>
                                    {genres.map(genre => (
                                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-1 text-sm">Sort By</label>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => setFilters({...filters, sort: e.target.value})}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                                >
                                    <option value="popularity.desc">Popularity</option>
                                    <option value="vote_average.desc">Rating</option>
                                    <option value="first_air_date.desc">Newest</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Current Filters Display */}
                    {(filters.year || filters.rating || filters.genre || filters.searchTerm) && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium mb-2">Current Filters:</h3>
                            <div className="flex flex-wrap gap-2">
                                {filters.year && (
                                    <span className="px-3 py-1 bg-gray-700 text-sm rounded-full">
                    Year: {filters.year}
                                        <button
                                            onClick={() => setFilters({...filters, year: ""})}
                                            className="ml-2 text-gray-400 hover:text-white"
                                        >
                      ×
                    </button>
                  </span>
                                )}
                                {filters.rating && (
                                    <span className="px-3 py-1 bg-gray-700 text-sm rounded-full">
                    Min Rating: {filters.rating}+
                    <button
                        onClick={() => setFilters({...filters, rating: ""})}
                        className="ml-2 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                                )}
                                {filters.genre && (
                                    <span className="px-3 py-1 bg-gray-700 text-sm rounded-full">
                    Genre: {genres.find(g => g.id.toString() === filters.genre)?.name || filters.genre}
                                        <button
                                            onClick={() => setFilters({...filters, genre: ""})}
                                            className="ml-2 text-gray-400 hover:text-white"
                                        >
                      ×
                    </button>
                  </span>
                                )}
                                {filters.searchTerm && (
                                    <span className="px-3 py-1 bg-gray-700 text-sm rounded-full">
                    Search: "{filters.searchTerm}"
                    <button
                        onClick={() => setFilters({...filters, searchTerm: ""})}
                        className="ml-2 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Results */}
                {error ? (
                    <div className="text-center py-8 bg-gray-800 rounded-xl">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <span className="bg-gradient-to-r from-purple-500 to-blue-500 w-2 h-6 rounded-full mr-2"></span>
                            {filters.searchTerm ? `Search Results for "${filters.searchTerm}"` : "TV Shows"}
                        </h2>

                        {tvShows.length === 0 && !loading ? (
                            <div className="text-center py-10 bg-gray-800 rounded-xl">
                                <FaTv className="text-5xl text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-400">
                                    {filters.searchTerm ? "No TV shows found matching your search" : "No TV shows found matching your criteria"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {tvShows.map((item, index) => (
                                    <div
                                        key={item.id}
                                        ref={index === tvShows.length - 1 ? lastTVShowElementRef : null}
                                        className="bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform duration-300 group"
                                        onClick={() => getTVShowDetails(item)}
                                    >
                                        <div className="relative pb-[150%]">
                                            {item.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                                    alt={item.name}
                                                    className="absolute top-0 left-0 w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                                                    <FaTv className="text-3xl text-gray-400" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                                                <div className="w-full">
                                                    <h3 className="text-sm font-bold line-clamp-2">{item.name}</h3>
                                                    <div className="flex justify-between text-xs text-gray-300 mt-1">
                                                        <span>{formatYear(item.first_air_date)}</span>
                                                        <div className="flex items-center">
                                                            <FaStar className="text-yellow-400 text-xs mr-1" />
                                                            <span>{item.vote_average}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(loading || loadingMore) && (
                                    <div className="col-span-full flex justify-center py-8">
                                        <div className="w-10 h-10 border-4 border-gray-400 border-t-purple-500 rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* TV Show Details */}
                {selectedItem && <ShowDetails />}
            </main>
        </div>
    );
}