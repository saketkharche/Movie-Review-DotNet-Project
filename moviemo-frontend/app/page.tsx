"use client";

import { useState, useEffect } from 'react';
import MovieCard from './components/MovieCard';
import PageSelector from './components/PageSelector';
import { useSearchParams } from 'next/navigation';

interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const pageIndex = searchParams.get('pageIndex') ?? '1';
  const pageSize = searchParams.get('pageSize') ?? '9';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMovieCount, setTotalMovieCount] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(
            `https://localhost:7179/api/movies?pageIndex=${pageIndex}&pageSize=${pageSize}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }

        const responseData = await response.json();
        setMovies(responseData.data);
        setTotalMovieCount(responseData.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [pageIndex, pageSize]);

  // Render loading state with skeleton
  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-violet-900 py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Welcome to Moviemo
              </span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
                Discover amazing movies while we load our collection
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-800"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-800 rounded w-full"></div>
                      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                    </div>
                  </div>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <div className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
    );
  }

  // Render error state with illustration
  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-violet-900 py-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Welcome to Moviemo
              </span>
              </h1>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-purple-900/30">
              <div className="flex flex-col items-center">
                <svg className="w-20 h-20 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
                <p className="text-gray-300 mb-6">{error}</p>

                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-violet-900 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Welcome to Moviemo
            </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              Discover the magic of cinema with our handpicked collection of movies
            </p>
          </div>

          {/* Movie Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {movies.map((movie) => (
                <div
                    key={movie.id}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <MovieCard movie={movie} />
                </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-16 flex justify-center">
            <PageSelector
                total={totalMovieCount}
                pageIndex={parseInt(pageIndex)}
                pageSize={parseInt(pageSize)}
            />
          </div>
        </div>
      </div>
  );
}