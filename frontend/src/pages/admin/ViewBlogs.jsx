import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { motion, AnimatePresence } from "framer-motion"; // For modal animations
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  ExternalLink,
  X as CloseIcon,
  Image as ImageIcon,
  Tags,
  Send,
  Type,
  FileText,
  ListChecks,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// --- Helper Components ---
const LoadingIndicator = ({ text = "Loading..." }) => (
  <div className="flex justify-center items-center py-10">
    <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mr-3" />
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
      className={`p-4 mb-4 text-sm rounded-lg border ${
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
      {" "}
      {label} {required && <span className="text-red-500">*</span>}{" "}
      {isOptional && (
        <span className="text-xs text-gray-500 ml-1">(Optional)</span>
      )}{" "}
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
// --- End Helper Components ---

// FIX: Use process.env for CRA compatibility
const API_BASE_URL = import.meta.env.VITE_API_URL;
const BLOG_API_URL = API_BASE_URL
  ? API_BASE_URL.replace("/auth", "/blogs")
  : "/api/blogs";

// --- Reusable Blog Form Component ---
const BlogForm = ({
  initialData = {},
  onSubmit,
  isSubmitting,
  mode = "add",
}) => {
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.content || "");
  const [status, setStatus] = useState(initialData.status || "draft");
  const [featuredImage, setFeaturedImage] = useState(
    initialData.featuredImage || ""
  );
  const [tags, setTags] = useState((initialData.tags || []).join(", ")); // Join array for input

  const handleFormSubmit = (e) => {
    e.preventDefault();
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
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
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
          <FileText className="h-5 w-5 text-gray-400 mr-2" /> Content{" "}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="content"
          rows="8"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          className="block text-sm font-medium text-gray-700 mb-1.5  items-center"
        >
          {" "}
          <ListChecks className="h-5 w-5 text-gray-400 mr-2" /> Status{" "}
          <span className="text-red-500 ml-1">*</span>{" "}
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
          disabled={isSubmitting}
          className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center min-w-[120px] px-6 py-2.5 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-linear-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isSubmitting ? (
            <LoadingIndicator
              text={mode === "add" ? "Publishing..." : "Updating..."}
            />
          ) : (
            <>
              {" "}
              <Send className="w-5 h-5 mr-2" />{" "}
              {mode === "add" ? "Publish Post" : "Update Post"}{" "}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

// --- Main ViewBlogs Component ---
const ViewBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState(null); // 'add', 'edit', or null
  const [currentPost, setCurrentPost] = useState(null); // Post data for editing
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [formError, setFormError] = useState(""); // Error specific to the modal form
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Fetch blog posts (using useCallback for potential optimization)
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const res = await axios.get(BLOG_API_URL, config);
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch blog posts:", err);
      setError(err.response?.data?.msg || "Failed to load blog posts.");
    } finally {
      setIsLoading(false);
    }
  }, [token]); // Dependency on token

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // Call fetchPosts when it changes (initially and if token changes)

  // --- Modal Handling ---
  const openAddModal = () => {
    setCurrentPost(null); // Clear any edit data
    setModalMode("add");
    setFormError("");
    setFormSuccess("");
  };

  const openEditModal = (post) => {
    setCurrentPost(post); // Set post data for editing
    setModalMode("edit");
    setFormError("");
    setFormSuccess("");
  };

  const closeModal = () => {
    setModalMode(null);
    setCurrentPost(null);
    setFormError("");
    setFormSuccess("");
    setIsSubmitting(false); // Reset submitting state on close
  };

  // --- API Call Handlers ---
  const handleAddPost = async (payload) => {
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.post(BLOG_API_URL, payload, config);
      setFormSuccess(`Post "${res.data.title}" created successfully!`);
      fetchPosts(); // Re-fetch posts to update the list
      setTimeout(closeModal, 1500); // Close modal after success
    } catch (err) {
      console.error("Failed to add post:", err);
      setFormError(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.msg ||
          "Failed to add post."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = async (payload) => {
    if (!currentPost?._id) return; // Should not happen if modal is open correctly
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.put(
        `${BLOG_API_URL}/${currentPost._id}`,
        payload,
        config
      );
      setFormSuccess(`Post "${res.data.title}" updated successfully!`);
      fetchPosts(); // Re-fetch posts
      setTimeout(closeModal, 1500);
    } catch (err) {
      console.error("Failed to edit post:", err);
      setFormError(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.msg ||
          "Failed to update post."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!token) {
      setError("Authentication required.");
      setDeleteConfirmation(null);
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${BLOG_API_URL}/${postId}`, config);
      setPosts(posts.filter((p) => p._id !== postId)); // Update state
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete post.");
    } finally {
      setDeleteConfirmation(null);
    }
  };

  // Modal animation variants
  const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const modalContentVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          {" "}
          Manage Blog Posts ({posts.length}){" "}
        </h2>
        <button
          onClick={openAddModal} // Open Add modal
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition duration-150 ease-in-out"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> Add New
          Post
        </button>
      </div>

      {/* Loading/Error States */}
      {isLoading && <LoadingIndicator text="Loading posts..." />}
      {error && <AlertMessage message={error} type="error" />}

      {/* Blog Post Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                    >
                      No blog posts found.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr
                      key={post._id}
                      className="hover:bg-gray-50 transition duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {" "}
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            post.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {" "}
                          {post.status}{" "}
                        </span>{" "}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.author?.fullName || post.author?.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link
                          to={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center group"
                          title="View Post"
                        >
                          {" "}
                          <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />{" "}
                        </Link>
                        <button
                          onClick={() => openEditModal(post)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Post"
                        >
                          {" "}
                          <Edit className="w-4 h-4" />{" "}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(post._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Post"
                        >
                          {" "}
                          <Trash2 className="w-4 h-4" />{" "}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Add/Edit Modal --- */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            key="blogModalBackdrop"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
            onClick={closeModal} // Close on backdrop click
          >
            <motion.div
              key="blogModalContent"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" // Added max-h and overflow
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10">
                <h3 className="text-lg font-semibold text-gray-900">
                  {" "}
                  {modalMode === "add"
                    ? "Add New Blog Post"
                    : "Edit Blog Post"}{" "}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
                >
                  {" "}
                  <CloseIcon className="w-5 h-5" />{" "}
                </button>
              </div>
              <div className="p-6 md:p-8">
                {" "}
                {/* Ensure padding inside scrolling area */}
                {formError && <AlertMessage message={formError} type="error" />}
                {formSuccess && (
                  <AlertMessage message={formSuccess} type="success" />
                )}
                <BlogForm
                  key={currentPost?._id || "add"}
                  initialData={modalMode === "edit" ? currentPost : {}}
                  onSubmit={
                    modalMode === "add" ? handleAddPost : handleEditPost
                  }
                  isSubmitting={isSubmitting}
                  mode={modalMode}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Delete Confirmation Modal --- */}
      <AnimatePresence>
        {deleteConfirmation && (
          <motion.div
            key="deleteModalBackdrop"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
            onClick={() => setDeleteConfirmation(null)}
          >
            <motion.div
              key="deleteModalContent"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                {" "}
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />{" "}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirm Deletion
                </h3>{" "}
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this blog post? This action
                  cannot be undone.
                </p>{" "}
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                >
                  {" "}
                  Cancel{" "}
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmation)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                >
                  {" "}
                  Delete{" "}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewBlogs;
