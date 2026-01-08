const express = require("express");
const router = express.Router();
const { check, param } = require("express-validator");
const { protect, isAdmin } = require("../middleware/auth.middleware");
const {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost,
} = require("../controllers/blog.controller");

// Validation rules for creating/updating a blog post
const blogPostValidation = [
  check("title", "Title is required").not().isEmpty().trim(),
  check("content", "Content is required").not().isEmpty().trim(),
  check("status", "Invalid status").optional().isIn(["draft", "published"]),
  check("tags", "Tags must be an array of strings").optional().isArray(),
  check("tags.*", "Each tag must be a string").optional().isString().trim(),
  check("featuredImage", "Featured image must be a valid URL")
    .optional({ checkFalsy: true })
    .isURL(),
];

// Validation rules for ID parameters
const idParamValidation = [param("id", "Invalid post ID").isMongoId()];
// Validation rules for Slug parameters
const slugParamValidation = [param("slug", "Invalid slug format").isSlug()];

// --- Blog Post Routes ---

// @route   POST /api/blogs
// @desc    Create a new blog post
// @access  Private/Admin
router.post("/", protect, isAdmin, blogPostValidation, createBlogPost);

// @route   GET /api/blogs
// @desc    Get all blog posts (published for public, all for admin)
// @access  Public (conditionally) / Private/Admin
// Note: We don't use 'protect' here initially, controller checks role if needed
router.get("/", getAllBlogPosts);

// @route   GET /api/blogs/:slug
// @desc    Get a single blog post by slug
// @access  Public (conditionally) / Private/Admin
// Note: 'protect' middleware is optional here for reading, controller checks role for drafts
router.get("/:slug", slugParamValidation, getBlogPostBySlug);

// @route   PUT /api/blogs/:id
// @desc    Update a blog post by ID
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  isAdmin,
  idParamValidation, // Validate ID format first
  blogPostValidation, // Then validate body content
  updateBlogPost
);

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog post by ID
// @access  Private/Admin
router.delete("/:id", protect, isAdmin, idParamValidation, deleteBlogPost);

module.exports = router;
