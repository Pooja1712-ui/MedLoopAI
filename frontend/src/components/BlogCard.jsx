import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, UserCircle, ArrowRight } from "lucide-react";

const BlogCard = ({ post }) => {
  if (!post) return null;

  // Function to create a short excerpt
  const createExcerpt = (content, maxLength = 150) => {
    if (!content) return "";
    // Basic cleanup (remove markdown images/links for excerpt)
    let cleanContent = content.replace(/!\[.*?\]\(.*?\)/g, ""); // Remove images
    cleanContent = cleanContent.replace(/\[.*?\]\(.*?\)/g, "$1"); // Keep link text
    cleanContent = cleanContent.replace(/#/g, ""); // Remove markdown headings
    if (cleanContent.length <= maxLength) return cleanContent;
    return cleanContent.substring(0, maxLength) + "...";
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-lg shadow-lg border border-gray-100 bg-white transition-shadow duration-300 hover:shadow-xl">
      {post.featuredImage && (
        <Link to={`/blog/${post.slug}`} className="block shrink-0">
          <img
            className="h-48 w-full object-cover"
            src={post.featuredImage}
            alt={post.title}
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex-1">
          {/* Tags (Optional) */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map(
                (
                  tag // Show max 3 tags
                ) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          )}
          <Link to={`/blog/${post.slug}`} className="mt-2 block">
            <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-700 transition duration-150 ease-in-out">
              {post.title}
            </h3>
            <p className="mt-3 text-sm text-gray-500 line-clamp-3">
              {createExcerpt(post.content)}
            </p>
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <UserCircle
              className="mr-1.5 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
            <span>
              {post.author?.fullName || post.author?.email || "MedLoopAi Team"}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarDays
              className="mr-1.5 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
        </div>
        <Link
          to={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium group"
        >
          Read More
          <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;
