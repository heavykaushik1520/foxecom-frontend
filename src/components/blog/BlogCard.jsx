import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/api";
import fallbackImage from "../../assest/images/product-item1.jpg";

const BlogCard = ({ blog }) => {
  const imageSrc = blog?.featuredImage ? getImageUrl(blog.featuredImage) : fallbackImage;
  const readingTime = blog?.readingTimeMinutes ? `${blog.readingTimeMinutes} min read` : null;

  return (
    <article className="card blog-card shadow-sm h-100">
      <div className="blog-card-media">
        <img src={imageSrc} alt={blog?.featuredImageAlt || blog?.title} loading="lazy" />
      </div>
      <div className="card-body d-flex flex-column">
        <div className="small text-muted mb-2 d-flex gap-2 flex-wrap">
          <span>{blog?.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "-"}</span>
          {readingTime && <span>• {readingTime}</span>}
        </div>
        <h5 className="blog-line-clamp-2">{blog?.title}</h5>
        <p className="text-muted blog-line-clamp-3">
          {blog?.excerpt || "Read the complete article for details."}
        </p>
        <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
          <div className="small text-truncate">
            {(blog?.tags || []).slice(0, 1).map((tag) => (
              <span className="badge bg-light text-dark" key={tag.id}>{tag.name}</span>
            ))}
          </div>
          <Link className="btn btn-sm btn-primary" to={`/blog/${blog.slug}`}>
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
