import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { blogAPI } from "../../../utils/api";
import BlogForm from "./BlogForm";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await blogAPI.adminGetById(id);
        setBlog(res?.blog || null);
      } catch (err) {
        setError(err.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      setError("");
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (k === "featuredImageFile" && v) formData.append("featuredImage", v);
        else if (k === "tags" || k === "relatedProductIds") formData.append(k, JSON.stringify(v || []));
        else if (v !== undefined && v !== null) formData.append(k, v);
      });
      await blogAPI.adminUpdate(id, formData);
      navigate("/admin/blogs");
    } catch (err) {
      setError(err.message || "Failed to update blog");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0 fw-bold">Edit Blog</h4>
        <Link to="/admin/blogs" className="btn btn-outline-secondary">Back</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-4"><div className="spinner-border" /></div>
      ) : blog ? (
        <BlogForm initialData={blog} onSubmit={handleSubmit} submitting={saving} mode="edit" />
      ) : (
        <div className="alert alert-light border">Blog not found.</div>
      )}
    </div>
  );
};

export default EditBlog;
