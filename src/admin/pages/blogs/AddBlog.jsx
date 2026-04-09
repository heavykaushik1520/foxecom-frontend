import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { blogAPI } from "../../../utils/api";
import BlogForm from "./BlogForm";

const AddBlog = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
      await blogAPI.adminCreate(formData);
      navigate("/admin/blogs");
    } catch (err) {
      setError(err.message || "Failed to create blog");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0 fw-bold">Create Blog</h4>
        <Link to="/admin/blogs" className="btn btn-outline-secondary">Back</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <BlogForm onSubmit={handleSubmit} submitting={saving} mode="create" />
    </div>
  );
};

export default AddBlog;
