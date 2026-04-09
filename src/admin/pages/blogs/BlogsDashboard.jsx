import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { blogAPI } from "../../../utils/api";

const BlogsDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await blogAPI.adminGetAll({ page, limit: 20, q: query, status, sort });
      setBlogs(res?.blogs || []);
      setPagination(res?.pagination || { totalPages: 1, totalItems: 0 });
    } catch (err) {
      setError(err.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, sort, status]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await blogAPI.adminDelete(id);
      load();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  const onToggleFeatured = async (id) => {
    try {
      await blogAPI.adminToggleFeatured(id);
      load();
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  const onToggleStatus = async (blog) => {
    try {
      const next = blog.status === "published" ? "draft" : "published";
      await blogAPI.adminSetStatus(blog.id, next);
      load();
    } catch (err) {
      setError(err.message || "Status update failed");
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 fw-bold">Blogs</h4>
        <Link to="/admin/blogs/create" className="btn btn-primary">Add Blog</Link>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <form className="row g-2" onSubmit={onSearch}>
            <div className="col-12 col-md-5">
              <input className="form-control" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title/slug" />
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select className="form-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
            <div className="col-12 col-md-3 d-grid">
              <button className="btn btn-outline-primary" type="submit">Apply</button>
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border" /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Updated</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((b) => (
                    <tr key={b.id}>
                      <td>{b.title}</td>
                      <td><small className="text-muted">{b.slug}</small></td>
                      <td>
                        <span className={`badge ${b.status === "published" ? "bg-success" : "bg-secondary"}`}>{b.status}</span>
                      </td>
                      <td>
                        <button className={`btn btn-sm ${b.isFeatured ? "btn-success" : "btn-outline-secondary"}`} onClick={() => onToggleFeatured(b.id)}>
                          {b.isFeatured ? "Yes" : "No"}
                        </button>
                      </td>
                      <td><small>{new Date(b.updatedAt).toLocaleDateString()}</small></td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => onToggleStatus(b)}>
                            {b.status === "published" ? "Unpublish" : "Publish"}
                          </button>
                          <Link to={`/admin/blogs/edit/${b.id}`} className="btn btn-sm btn-outline-primary">Edit</Link>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(b.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {blogs.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No blogs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3 gap-2">
          <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span className="align-self-center small">Page {page} / {pagination.totalPages}</span>
          <button className="btn btn-outline-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default BlogsDashboard;
