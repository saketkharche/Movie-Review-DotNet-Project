"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Movie } from "@/app/types/movie";
import { Review } from "@/app/types/review";
import { Comment } from "@/app/types/comment";
import { apiService } from "@/app/services/api";
import { VoteType } from "@/app/types/vote";
import { Vote, Edit, Trash2 } from "lucide-react";
import { getCurrentUserId } from "@/app/utils/user";
import {FaFilm} from "react-icons/fa";

const OMDB_API_KEY = "5be075a5";
const OMDB_API_URL = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;

export default function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newReview, setNewReview] = useState({ body: "", userScore: 0 });
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<{
    id: number;
    body: string;
  } | null>(null);
  const [editingReview, setEditingReview] = useState<{
    id: number;
    body: string;
    userScore: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(-1);
  const [streamLoading, setStreamLoading] = useState(false);

  const apiUrl = `https://localhost:7179/api/movies/${id}`;
  const usersApiUrl = "https://localhost:7179/api/users";
  const reviewsApiUrl = "https://localhost:7179/api/reviews";
  const commentsApiUrl = "https://localhost:7179/api/comments";
  const votesApiUrl = "https://localhost:7179/api/votes";

  // Fetch IMDb ID using OMDB API
  const fetchImdbId = async (title: string) => {
    try {
      setStreamLoading(true);
      const response = await fetch(
          `${OMDB_API_URL}&t=${encodeURIComponent(title)}`
      );
      const data = await response.json();
      if (data.Response === "True" && data.imdbID) {
        setImdbId(data.imdbID);
      } else {
        console.warn("IMDb ID not found for title:", title);
      }
    } catch (error) {
      console.error("Failed to fetch IMDb ID:", error);
    } finally {
      setStreamLoading(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoIdMatch = url.match(/(?:v=|\.be\/)([^&?]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "";
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getVoteId = async (commentId: number) => {
    try {
      const response = await fetch(
          `${votesApiUrl}?userId=${currentUserId!}&commentId=${commentId}`,
          { method: "GET", headers: apiService.getHeaders() }
      );

      const data = await response.json();
      return [data.id, data.voteType];
    } catch (err) {
      console.error("Vote GET error:", err);
      return [null, null];
    }
  };

  const handleVote = async (commentId: number, inputVoteType: number) => {
    if (!apiService.isAuthenticated()) {
      window.location.href = "/login";
    }

    const data = await getVoteId(commentId);
    const id: number = data[0];
    const voteType: number = data[1];

    let updatedComments = [...comments];

    const commentIndex = comments.findIndex((c) => c.id === commentId);

    if ((id === -1 && voteType === -2) || (id == null && voteType == null)) {
      await fetch(votesApiUrl, {
        method: "POST",
        body: JSON.stringify({ voteType: inputVoteType, commentId }),
        headers: apiService.getHeaders(true),
      });

      if (inputVoteType === VoteType.upvote) {
        updatedComments[commentIndex].upvoteCounter += 1;
      } else {
        updatedComments[commentIndex].downvoteCounter += 1;
      }
    } else if (voteType === inputVoteType) {
      await fetch(`${votesApiUrl}/${id}`, {
        method: "DELETE",
        headers: apiService.getHeaders(true),
      });
      if (inputVoteType == VoteType.upvote) {
        updatedComments[commentIndex].upvoteCounter -= 1;
      } else {
        updatedComments[commentIndex].downvoteCounter -= 1;
      }
    } else {
      await fetch(`${votesApiUrl}/${id}`, {
        method: "PUT",
        body: JSON.stringify({ voteType: inputVoteType }),
        headers: apiService.getHeaders(true),
      });
      if (inputVoteType == VoteType.upvote) {
        updatedComments[commentIndex].upvoteCounter += 1;
        updatedComments[commentIndex].downvoteCounter -= 1;
      } else {
        updatedComments[commentIndex].upvoteCounter -= 1;
        updatedComments[commentIndex].downvoteCounter += 1;
      }
    }
    setComments(updatedComments);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    if (!apiService.isAuthenticated()) {
      window.location.href = "/login";
    }

    if (reviews.find((r) => r.userId == currentUserId)) {
      alert("You can't post multiple reviews.");
      return;
    }

    e.preventDefault();
    try {
      await fetch(reviewsApiUrl, {
        method: "POST",
        body: JSON.stringify({ movieId: id, ...newReview }),
        headers: apiService.getHeaders(true),
      });
      const response = await fetch(`${reviewsApiUrl}?movieId=${id}`, {
        headers: apiService.getHeaders(),
      });
      const updatedReviews = await response.json();
      const reviewsWithUsername = await Promise.all(
          updatedReviews.map(async (review: Review) => {
            const username = await fetchUsername(review.userId);
            return { ...review, username };
          })
      );
      setReviews(reviewsWithUsername);
      setNewReview({ body: "", userScore: 0 });
    } catch (err) {
      console.error("Review submit error:", err);
    }
  };

  // Calculate average rating whenever reviews change
  useEffect(() => {
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, review) => sum + review.userScore, 0);
      const avg = total / reviews.length;
      setAverageRating(Math.round(avg * 10) / 10); // Round to one decimal
      setRatingCount(reviews.length);
    } else {
      setAverageRating(null);
      setRatingCount(0);
    }
  }, [reviews]);
  const handleCommentSubmit = async (e: React.FormEvent) => {
    if (!apiService.isAuthenticated()) {
      window.location.href = "/login";
    }

    e.preventDefault();
    try {
      await fetch(commentsApiUrl, {
        method: "POST",
        body: JSON.stringify({ movieId: id, body: newComment }),
        headers: apiService.getHeaders(true),
      });
      const response = await fetch(`${commentsApiUrl}?movieId=${id}`, {
        headers: apiService.getHeaders(),
      });
      const updatedComments = await response.json();
      const commentsWithUsername = await Promise.all(
          updatedComments.map(async (comment: Comment) => {
            const username = await fetchUsername(comment.userId);
            return { ...comment, username };
          })
      );
      setComments(commentsWithUsername);
      setNewComment("");
    } catch (err) {
      console.error("Comment submit error:", err);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (editingComment) {
      try {
        await fetch(`${commentsApiUrl}/${commentId}`, {
          method: "PUT",
          body: JSON.stringify({ body: editingComment.body }),
          headers: apiService.getHeaders(true),
        });
        const updatedComments = comments.map((comment) =>
            comment.id === commentId
                ? { ...comment, body: editingComment.body }
                : comment
        );
        setComments(updatedComments);
        setEditingComment(null);
      } catch (err) {
        console.error("Comment edit error:", err);
      }
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await fetch(`${commentsApiUrl}/${commentId}`, {
        method: "DELETE",
        headers: apiService.getHeaders(true),
      });
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (err) {
      console.error("Comment delete error:", err);
    }
  };

  const handleEditReview = async (reviewId: number) => {
    if (editingReview) {
      try {
        await fetch(`${reviewsApiUrl}/${reviewId}`, {
          method: "PUT",
          body: JSON.stringify({
            body: editingReview.body,
            userScore: editingReview.userScore,
          }),
          headers: apiService.getHeaders(true),
        });
        const updatedReviews = reviews.map((review) =>
            review.id === reviewId
                ? {
                  ...review,
                  body: editingReview.body,
                  userScore: editingReview.userScore,
                }
                : review
        );
        setReviews(updatedReviews);
        setEditingReview(null);
      } catch (err) {
        console.error("Review edit error:", err);
      }
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await fetch(`${reviewsApiUrl}/${reviewId}`, {
        method: "DELETE",
        headers: apiService.getHeaders(true),
      });
      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (err) {
      console.error("Review delete error:", err);
    }
  };

  const fetchUsername = async (userId: number) => {
    const response = await fetch(`${usersApiUrl}/${userId}`, {
      method: "GET",
      headers: apiService.getHeaders(),
    });
    const { username } = await response.json();
    return username;
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(apiUrl, {
          headers: apiService.getHeaders(),
        });
        const { id, title, overview, posterPath, trailerUrl } =
            await response.json();
        setMovie({ id, title, overview, posterPath, trailerUrl });

        // Fetch IMDb ID when movie data is available
        if (title) {
          fetchImdbId(title);
        }
      } catch (err) {
        console.error("Fetch movie error:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`${reviewsApiUrl}?movieId=${id}`, {
          headers: apiService.getHeaders(),
        });
        const reviews = await response.json();
        const reviewsWithUsername = await Promise.all(
            reviews.map(async (review: Review) => {
              const username = await fetchUsername(review.userId);
              return { ...review, username };
            })
        );
        setReviews(reviewsWithUsername);
      } catch (err) {
        console.error("Fetch reviews error:", err);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(`${commentsApiUrl}?movieId=${id}`, {
          headers: apiService.getHeaders(),
        });
        const comments = await response.json();
        const commentsWithUsername = await Promise.all(
            comments.map(async (comment: Comment) => {
              const username = await fetchUsername(comment.userId);
              return { ...comment, username };
            })
        );
        setComments(commentsWithUsername);
      } catch (err) {
        console.error("Fetch comments error:", err);
      }
    };

    const getAndSetCurrentUserId = async () => {
      try {
        const id = await getCurrentUserId();

        if (id != null) {
          setCurrentUserId(id);
        }
      } catch (err) {
        console.error("Fetch user ID error: ", err);
      }
    };

    const fetchDetails = async () => {
      await Promise.all([
        fetchMovie(),
        fetchReviews(),
        fetchComments(),
        getAndSetCurrentUserId(),
      ]);
      setLoading(false);
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500"></div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 sm:px-6 lg:px-8 py-12">
        {/* Streaming Player Modal */}
        {showPlayer && imdbId && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-lg w-full max-w-4xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                  <h3 className="text-xl font-bold text-white">
                    Streaming: {movie?.title}
                  </h3>
                  <button
                      onClick={() => setShowPlayer(false)}
                      className="text-gray-400 hover:text-white text-2xl"
                  >
                    &times;
                  </button>
                </div>

                <div className="relative pb-[56.25%] h-0">
                  <iframe
                      src={`https://111movies.com/movie/${imdbId}`}
                      title={`MovieMo - ${movie?.title}`}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                  />
                </div>

                <div className="p-4 text-sm text-gray-400">
                  <p>
                    Streaming via MovieMo • Content provided by third-party services
                  </p>
                  <p className="mt-2 text-xs">
                    <strong>Disclaimer:</strong> MovieMo is a content aggregator and
                    does not host any videos. Use at your own discretion.
                  </p>
                </div>
              </div>
            </div>
        )}

        <div className="max-w-5xl mx-auto">
          {/* Movie Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Poster - Fixed aspect ratio container */}
            <div className="flex flex-col">
              <div className="relative aspect-[2/3] w-full rounded-lg shadow-2xl border border-white/20 overflow-hidden bg-gray-800">
                {movie?.posterPath ? (
                    <img
                        src={movie.posterPath}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaFilm className="text-4xl text-gray-500" />
                    </div>
                )}
              </div>

              {/* Watch Now Button */}
              <button
                  onClick={() => imdbId && setShowPlayer(true)}
                  disabled={streamLoading || !imdbId}
                  className={`mt-4 w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 ${
                      streamLoading || !imdbId
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  }`}
              >
                {streamLoading ? "Loading Stream..." : "Watch Now"}
              </button>
              {!imdbId && !streamLoading && (
                  <p className="text-red-400 text-sm mt-2 text-center">
                    Streaming not available for this movie
                  </p>
              )}
            </div>

            {/* Trailer and Overview */}
            <div className="flex flex-col space-y-6 h-full">
              <div className="relative pb-[56.25%] rounded-lg overflow-hidden shadow-2xl border border-white/20">
                {movie?.trailerUrl ? (
                    <iframe
                        src={getEmbedUrl(movie.trailerUrl)}
                        title={movie.title}
                        className="absolute top-0 left-0 w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <FaFilm className="text-4xl text-gray-500" />
                    </div>
                )}
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-3xl font-extrabold text-white mb-4">
                  {movie?.title}
                </h2>
                <p className="text-gray-300">{movie?.overview}</p>
              </div>
            </div>
          </div>

          {/* Average Rating in Movie Overview */}
          {averageRating !== null ? (
              <div className="flex items-center mb-4">
                <span className="text-yellow-400 text-xl mr-2">★</span>
                <span className="text-white text-xl font-bold">
              {averageRating.toFixed(1)}
            </span>
                <span className="text-gray-300 ml-2">
              ({ratingCount} review{ratingCount !== 1 ? "s" : ""})
            </span>
              </div>
          ) : (
              <p className="text-gray-300 mb-4">No ratings yet</p>
          )}

          {/* Average Rating Banner */}
          {averageRating !== null && (
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 mb-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-2xl mr-3">★</span>
                    <span className="text-white text-2xl font-bold">
                  {averageRating.toFixed(1)}
                </span>
                    <span className="text-gray-300 ml-2">/ 10</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {ratingCount} review{ratingCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-gray-300 text-sm">Based on user reviews</p>
                  </div>
                </div>
              </div>
          )}

          {/* Reviews Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Reviews</h2>
            {/* Review Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label
                      htmlFor="review"
                      className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    Write Your Review
                  </label>
                  <textarea
                      id="review"
                      value={newReview.body}
                      onChange={(e) =>
                          setNewReview({ ...newReview, body: e.target.value })
                      }
                      className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Share your thoughts about the movie"
                      rows={4}
                  />
                </div>
                <div>
                  <label
                      htmlFor="userScore"
                      className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    Your Score (0-10)
                  </label>
                  <input
                      id="userScore"
                      type="number"
                      min="0"
                      max="10"
                      value={newReview.userScore}
                      onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            userScore: parseInt(e.target.value),
                          })
                      }
                      className="block w-24 px-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <button
                    type="submit"
                    className="group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105"
                >
                  Submit Review
                </button>
              </form>
            </div>
            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                  <div
                      key={review.id}
                      className="relative bg-white/10 backdrop-blur-lg rounded-lg p-4 shadow-2xl border border-white/20"
                  >
                    {editingReview && editingReview.id === review.id ? (
                        <div className="space-y-4">
                    <textarea
                        value={editingReview.body}
                        onChange={(e) =>
                            setEditingReview({
                              ...editingReview,
                              body: e.target.value,
                            })
                        }
                        className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Edit your review"
                        rows={4}
                    />
                          <input
                              type="number"
                              min="0"
                              max="10"
                              value={editingReview.userScore}
                              onChange={(e) =>
                                  setEditingReview({
                                    ...editingReview,
                                    userScore: parseInt(e.target.value),
                                  })
                              }
                              className="block w-24 px-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                          <div className="flex space-x-2">
                            <button
                                onClick={() => handleEditReview(review.id)}
                                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                            >
                              Save
                            </button>
                            <button
                                onClick={() => setEditingReview(null)}
                                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                          {/* Review Header - Date, Username and Action Buttons */}
                          <div className="flex justify-between items-start">
                            <div className="text-gray-300">
                        <span className="font-medium text-white">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>{" "}
                              <span className="font-medium text-white">
                          {review.username}
                        </span>
                            </div>
                            {currentUserId === review.userId ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                      onClick={() =>
                                          setEditingReview({
                                            id: review.id,
                                            body: review.body,
                                            userScore: review.userScore,
                                          })
                                      }
                                      className="text-gray-400 hover:text-white transition-colors p-1"
                                      title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                      onClick={() => handleDeleteReview(review.id)}
                                      className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                      title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                            ) : (
                                <div></div>
                            )}
                          </div>
                          {/* Review Body */}
                          <p className="text-gray-300 pr-4">{review.body}</p>
                          {/* Review Score */}
                          <div className="flex items-center justify-end">
                      <span
                          className={`w-8 h-8 rounded-full text-white text-sm font-medium flex items-center justify-center ${
                              review.userScore <= 4
                                  ? "bg-red-500"
                                  : review.userScore <= 7
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                          }`}
                      >
                        {review.userScore}
                      </span>
                          </div>
                        </div>
                    )}
                  </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Comments</h2>
            {/* Comment Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div>
                  <label
                      htmlFor="comment"
                      className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    Write Your Comment
                  </label>
                  <textarea
                      id="comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Share your comment"
                      rows={3}
                  />
                </div>
                <button
                    type="submit"
                    className="group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105"
                >
                  Submit Comment
                </button>
              </form>
            </div>
            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                  <div
                      key={comment.id}
                      className="bg-white/10 backdrop-blur-lg rounded-lg p-4 shadow-2xl border border-white/20"
                  >
                    {editingComment && editingComment.id === comment.id ? (
                        <div className="space-y-4">
                    <textarea
                        value={editingComment.body}
                        onChange={(e) =>
                            setEditingComment({
                              ...editingComment,
                              body: e.target.value,
                            })
                        }
                        className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        rows={3}
                    />
                          <div className="flex space-x-2">
                            <button
                                onClick={() => handleEditComment(comment.id)}
                                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                            >
                              Save
                            </button>
                            <button
                                onClick={() => setEditingComment(null)}
                                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                          {/* Comment Header - Date, Username and Action Buttons */}
                          <div className="flex justify-between items-start">
                            <div className="text-gray-300">
                        <span className="font-medium text-white">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>{" "}
                              <span className="font-medium text-white">
                          {comment.username}
                        </span>
                            </div>
                            {currentUserId == comment.userId ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                      onClick={() =>
                                          setEditingComment({
                                            id: comment.id,
                                            body: comment.body,
                                          })
                                      }
                                      className="text-gray-400 hover:text-white transition-colors p-1"
                                      title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                      title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                            ) : (
                                <div></div>
                            )}
                          </div>

                          {/* Comment Body */}
                          <p className="text-gray-300 pr-4">{comment.body}</p>

                          {/* Vote Buttons */}
                          <div className="flex items-center justify-end space-x-2 pt-2">
                            <button
                                onClick={() =>
                                    handleVote(comment.id, VoteType.downvote)
                                }
                                className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                title="Dislike"
                            >
                              <Vote className="h-4 w-4 rotate-180" />
                            </button>
                            <span className="text-white font-medium min-w-[20px] text-center">
                        {comment.upvoteCounter - comment.downvoteCounter}
                      </span>
                            <button
                                onClick={() => handleVote(comment.id, VoteType.upvote)}
                                className="text-gray-400 hover:text-green-400 transition-colors p-1"
                                title="Like"
                            >
                              <Vote className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}