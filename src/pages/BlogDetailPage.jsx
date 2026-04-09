import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { blogAPI, getImageUrl } from "../utils/api";

const getEmbedUrl = (url) => {
  if (!url) return "";
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (host.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (host.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }
    return "";
  } catch (error) {
    return "";
  }
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const [detail, relBlogs, relProducts] = await Promise.all([
          blogAPI.getBySlug(slug),
          blogAPI.getRelatedBlogs(slug),
          blogAPI.getRelatedProducts(slug),
        ]);
        setBlog(detail?.blog || null);
        setRelatedBlogs(relBlogs?.blogs || []);
        setRelatedProducts(relProducts?.products || []);
      } catch (err) {
        setError(err.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [slug]);

  if (loading) return <div className="padding-large text-center"><div className="spinner-border" /></div>;
  if (error) return <div className="padding-large container"><div className="alert alert-danger">{error}</div></div>;
  if (!blog) return <div className="padding-large container"><div className="alert alert-light border">Blog not found.</div></div>;

  const embedUrl = getEmbedUrl(blog.videoUrl);

  return (
    <div className="padding-large">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/blogs">Blogs</Link></li>
            <li className="breadcrumb-item active">{blog.title}</li>
          </ol>
        </nav>

        <div className="blog-content mx-auto">
          <h1 className="mb-2">{blog.title}</h1>
          <div className="d-flex flex-wrap gap-3 small text-muted mb-4">
            <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "-"}</span>
            <span>{blog.authorName || "FOXECOM Team"}</span>
            <span>{blog.readingTimeMinutes || 1} min read</span>
          </div>

          {blog.featuredImage && (
            <img
              src={getImageUrl(blog.featuredImage)}
              alt={blog.featuredImageAlt || blog.title}
              className="img-fluid rounded-3 mb-4"
            />
          )}

          {embedUrl && (
            <div className="blog-video-embed mb-4">
              <iframe src={embedUrl} title="Blog video" allowFullScreen loading="lazy" />
            </div>
          )}

          <article className="mb-4" dangerouslySetInnerHTML={{ __html: blog.contentHtml }} />

          {(blog.tags || []).length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag) => (
                <Link key={tag.id} to={`/blogs?tag=${encodeURIComponent(tag.slug)}`} className="badge bg-light text-dark">
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-5">
            <h4 className="mb-3">Related Products</h4>
            <div className="row g-3">
              {relatedProducts.map((p) => (
                <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                  <Link to={`/product/${p.slug || p.id}`} className="text-decoration-none">
                    <div className="card h-100 shadow-sm">
                      <img src={getImageUrl(p.thumbnailImage)} className="card-img-top" alt={p.title} style={{ aspectRatio: "1 / 1", objectFit: "cover" }} />
                      <div className="card-body">
                        <p className="mb-1 blog-line-clamp-2 text-dark small fw-semibold">{p.title}</p>
                        <small className="text-muted">₹ {Number(p.discountPrice || p.price || 0).toFixed(2)}</small>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedBlogs.length > 0 && (
          <section className="mt-5">
            <h4 className="mb-3">Related Blogs</h4>
            <div className="row g-3">
              {relatedBlogs.map((rb) => (
                <div className="col-12 col-md-4" key={rb.id}>
                  <Link to={`/blog/${rb.slug}`} className="text-decoration-none">
                    <div className="card h-100 shadow-sm">
                      <img src={getImageUrl(rb.featuredImage)} alt={rb.title} className="card-img-top" />
                      <div className="card-body">
                        <p className="mb-0 text-dark blog-line-clamp-2 fw-semibold">{rb.title}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage;
