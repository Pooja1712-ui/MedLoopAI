import React, { useState, useEffect } from "react";
import axios from "axios";
import BlogCard from "../components/BlogCard.jsx"; // Adjust path if needed
import { Loader2, AlertCircle } from "lucide-react";

// --- Helper Components ---
const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mr-3" />
    <span>Loading posts...</span>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div
    className="flex items-center p-4 my-6 text-sm text-red-700 bg-red-100 rounded-lg max-w-2xl mx-auto"
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

const BlogListPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPublishedPosts = async () => {
      setIsLoading(true);
      setError("");
      try {
        // The backend getAllBlogPosts controller automatically filters
        // for 'published' status if the user is not an admin.
        // No need to send specific query params here for public view.
        const res = await axios.get(BLOG_API_URL);
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch blog posts:", err);
        setError(err.response?.data?.msg || "Failed to load blog posts.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublishedPosts();
  }, []); // Fetch only once on mount

  return (
    <div className="bg-gray-50 py-12 md:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Awareness & Education
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed about safe medicine handling, donation impacts, and
            healthcare accessibility.
          </p>
        </div>

        {isLoading && <LoadingIndicator />}
        {error && <ErrorMessage message={error} />}

        {!isLoading &&
          !error &&
          (posts.length === 0 ? (
            <p className="text-center text-gray-500">
              No blog posts published yet. Check back soon!
            </p>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
              {posts.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default BlogListPage;
