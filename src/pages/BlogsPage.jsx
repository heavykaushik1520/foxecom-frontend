import React, { useEffect, useMemo, useState } from "react";
import { blogAPI } from "../utils/api";
import BlogCard from "../components/blog/BlogCard";
import BlogCardSkeleton from "../components/blog/BlogCardSkeleton";

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [blogsRes, tagsRes] = await Promise.all([
        blogAPI.getPublished({ page, limit: 9, q: search, tag: selectedTag, sort }),
        blogAPI.getTags(),
      ]);
      setBlogs(blogsRes?.blogs || []);
      setPagination(blogsRes?.pagination || { totalPages: 1, totalItems: 0 });
      setTags(tagsRes?.tags || []);
    } catch (err) {
      setError(err.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, sort, selectedTag]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const hasFilters = useMemo(() => search || selectedTag || sort !== "newest", [search, selectedTag, sort]);

  return (
    <div className="padding-large blog-page">
      <div className="container">
        <section className="blog-hero p-3 p-md-4 mb-4">
          <h1 className="mb-2 text-uppercase">Blogs</h1>
          {/* <p className="text-muted mb-0">Insights, buying guides, and updates from FOXECOM.</p> */}
        </section>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <form className="row g-2" onSubmit={onSearch}>
              <div className="col-12 col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search blogs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-3">
                <select className="form-select" value={selectedTag} onChange={(e) => { setSelectedTag(e.target.value); setPage(1); }}>
                  <option value="">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.slug}>{tag.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-2">
                <select className="form-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
              <div className="col-12 col-md-2 d-grid">
                <button className="btn btn-primary" type="submit">Apply</button>
              </div>
            </form>
            {hasFilters && (
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => { setSearch(""); setSelectedTag(""); setSort("newest"); setPage(1); }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="row g-3 g-xl-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div className="col-12 col-md-6 col-lg-4" key={idx}>
                <BlogCardSkeleton />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="alert alert-light border">No blogs found.</div>
        ) : (
          <div className="row g-3 g-xl-4">
            {blogs.map((blog) => (
              <div className="col-12 col-md-6 col-lg-4" key={blog.id}>
                <BlogCard blog={blog} />
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4 gap-2">
            <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span className="align-self-center small text-muted">Page {page} of {pagination.totalPages}</span>
            <button className="btn btn-outline-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
