import React, { useState } from "react";
import { motion } from "framer-motion";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Tags,
  Send,
  Type, // Icon for Title
  FileText, // Icon for Content
  ListChecks, // Icon for Status
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// --- Helper Components ---
const LoadingSpinner = ({ text = "Submitting..." }) => (
  <div className="flex justify-center items-center">
    <Loader2 className="h-5 w-5 text-white animate-spin mr-2" />
    <span>{text}</span>
  </div>
);

const AlertMessage = ({ message, type = "error" }) => {
  const isError = type === "error";
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 mb-6 text-sm rounded-lg border ${
        isError
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-green-50 border-green-200 text-green-800"
      }`}
      role="alert"
    >
      <div className="flex items-center">
        {isError ? (
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 mr-3 shrink-0" />
        )}
        <span className="font-medium">{message}</span>
      </div>
    </motion.div>
  );
};

// Simple Input Field component with icon (Modernized)
const InputField = ({
  icon: Icon,
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  maxLength,
  disabled = false,
  isOptional = false,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1.5"
    >
      {label} {required && <span className="text-red-500">*</span>}
      {isOptional && (
        <span className="text-xs text-gray-500 ml-1">(Optional)</span>
      )}
    </label>
    <div className="relative rounded-md shadow-sm">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={`block w-full border border-gray-300 rounded-lg py-2.5 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out ${
          Icon ? "pl-11" : "pl-4"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
    </div>
  </div>
);


const API_BASE_URL = import.meta.env.VITE_API_URL;
const BLOG_API_URL = API_BASE_URL
  ? API_BASE_URL.replace("/auth", "/blogs")
  : "/api/blogs";

const AddBlog = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (!token) {
      setError("Authentication required. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        title,
        content,
        status,
        ...(featuredImage && { featuredImage }),
        ...(tags && {
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== ""),
        }),
      };

      const res = await axios.post(BLOG_API_URL, payload, config);

      setSuccess(
        `Blog post "${res.data.title}" created successfully! Redirecting...`
      );
      setTitle("");
      setContent("");
      setStatus("draft");
      setFeaturedImage("");
      setTags("");

      setTimeout(() => {
        navigate("/admin-dashboard/blogs");
      }, 2000); // Increased delay for message visibility
    } catch (err) {
      console.error("Failed to create blog post:", err);
      setError(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.msg ||
          "Failed to create blog post."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {" "}
      {/* Centered layout */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Create New Blog Post
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Share awareness and educational content with the community.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200"
      >
        {/* Messages */}
        {error && <AlertMessage message={error} type="error" />}
        {success && <AlertMessage message={success} type="success" />}

        <InputField
          icon={Type}
          label="Post Title"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter a catchy title"
          disabled={isSubmitting}
        />

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1.5  items-center"
          >
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            Content <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="content"
            rows="12"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={isSubmitting}
            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Write your blog post content here... Markdown is supported!"
          ></textarea>
          <p className="mt-1.5 text-xs text-gray-500">
            You can use Markdown for formatting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            icon={ImageIcon}
            label="Featured Image URL"
            id="featuredImage"
            name="featuredImage"
            type="url"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={isSubmitting}
            isOptional
          />

          <InputField
            icon={Tags}
            label="Tags"
            id="tags"
            name="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="donation, medicine, awareness"
            disabled={isSubmitting}
            isOptional
            helperText="Comma-separated"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className=" text-sm font-medium text-gray-700 mb-1.5 flex items-center"
          >
            <ListChecks className="h-5 w-5 text-gray-400 mr-2" />
            Status <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            disabled={isSubmitting}
            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="draft">Draft (Save for later)</option>
            <option value="published">Published (Make visible)</option>
          </select>
        </div>

        <div className="flex justify-end pt-5 border-t border-gray-200 mt-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center min-w-[120px] px-6 py-2.5 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-linear-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isSubmitting ? (
              <LoadingSpinner text="Publishing..." />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" /> Publish Post
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;
