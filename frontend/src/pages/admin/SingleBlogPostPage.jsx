import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  UserCircle,
  CalendarDays,
  Tag,
} from "lucide-react";
import ReactMarkdown from "react-markdown"; // Import react-markdown
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown (tables, etc.)
import { useAuth } from "../../context/AuthContext";

// --- Helper Components ---
const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mr-3" />
    <span>Loading post...</span>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div
    className="flex items-center p-4 my-6 text-sm text-red-700 bg-red-100 rounded-lg"
    role="alert"
  >
    <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
    <span className="font-medium">{message || "An error occurred."}</span>
  </div>
);
// --- End Helper Components ---

// Read API URL from environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
const BLOG_API_URL = API_BASE_URL
  ? API_BASE_URL.replace("/auth", "/blogs")
  : "/api/blogs";

const SingleBlogPostPage = () => {
  const { slug } = useParams(); // Get the slug from the URL parameters
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, user } = useAuth(); // Needed to potentially view drafts if admin
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setError("");
      setPost(null); // Reset post state on new fetch
      try {
        // Send token if available, backend decides access (e.g., for drafts)
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const res = await axios.get(`${BLOG_API_URL}/${slug}`, config);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to fetch blog post:", err);
        if (err.response?.status === 404) {
          setError(`Blog post "${slug}" not found.`);
        } else if (err.response?.status === 403) {
          setError("You are not authorized to view this draft post.");
        } else {
          setError(err.response?.data?.msg || "Failed to load blog post.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    } else {
      setError("No blog post specified in the URL.");
      setIsLoading(false);
    }
  }, [slug, token]); // Re-fetch if slug or token changes

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10 text-center">
        <ErrorMessage message={error} />
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:underline inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Go Back
        </button>
        <span className="mx-2 text-gray-400">|</span>
        <Link to="/" className="text-indigo-600 hover:underline">
          Go Home
        </Link>
      </div>
    );
  }

  if (!post) {
    // This case might occur briefly or if fetch fails silently
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10 text-center">
        Post data is not available.
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 md:py-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)} // Go back to the previous page
        className="inline-flex items-center text-gray-600 hover:text-indigo-700 mb-8 group transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
        Back
      </button>

      <article className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-100">
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-auto max-h-80 object-cover rounded-lg mb-6 shadow" // Adjusted image height
          />
        )}
        {/* Status Badge (Visible for Admins on Drafts) */}
        {user?.role === "admin" && post.status === "draft" && (
          <span className="mb-3 inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 uppercase">
            Draft
          </span>
        )}

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        {/* Metadata */}
        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 space-x-4 border-b pb-4">
          <div className="flex items-center" title="Author">
            <UserCircle className="w-4 h-4 mr-1.5 shrink-0" />
            <span>
              {post.author?.fullName || post.author?.email || "Unknown Author"}
            </span>
          </div>
          <div className="flex items-center" title="Published Date">
            <CalendarDays className="w-4 h-4 mr-1.5 shrink-0" />
            <span>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Content Rendered with react-markdown */}
        <div className="prose prose-indigo lg:prose-lg max-w-none text-gray-700 leading-relaxed mt-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center gap-2">
            <Tag className="w-5 h-5 text-gray-500 shrink-0" />
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-sm font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
};

export default SingleBlogPostPage;
