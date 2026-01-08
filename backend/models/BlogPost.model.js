const mongoose = require("mongoose");
const slugify = require("slugify"); // We'll install this

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [150, "Title cannot be more than 150 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide content"],
    },
    slug: {
      // URL-friendly version of the title
      type: String,
      unique: true,
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Link to the User model (likely an admin)
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    featuredImage: {
      // Optional image URL
      type: String,
    },
    tags: [String], // Optional array of tags/keywords
  },
  {
    timestamps: true,
  }
);

// Middleware to create slug from title before saving
BlogPostSchema.pre("save", function (next) {
  if (!this.isModified("title")) {
    return next();
  }
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

// Middleware to update slug if title changes (on findOneAndUpdate)
// Note: This requires careful handling if you use findByIdAndUpdate directly
BlogPostSchema.pre("findOneAndUpdate", async function (next) {
  // 'this' refers to the query
  const update = this.getUpdate();
  if (update.title) {
    update.slug = slugify(update.title, { lower: true, strict: true });
  }
  next();
});

const BlogPost = mongoose.model("BlogPost", BlogPostSchema);

module.exports = BlogPost;
