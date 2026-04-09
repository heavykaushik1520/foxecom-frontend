import React from "react";

const BlogCardSkeleton = () => {
  return (
    <div className="card blog-card shadow-sm h-100">
      <div className="blog-card-media skeleton" />
      <div className="card-body">
        <div className="skeleton mb-2" style={{ height: 14, width: "40%" }} />
        <div className="skeleton mb-2" style={{ height: 18, width: "90%" }} />
        <div className="skeleton mb-2" style={{ height: 18, width: "75%" }} />
        <div className="skeleton mb-2" style={{ height: 14, width: "100%" }} />
        <div className="skeleton mb-3" style={{ height: 14, width: "90%" }} />
        <div className="d-flex justify-content-between">
          <div className="skeleton" style={{ height: 24, width: 80 }} />
          <div className="skeleton" style={{ height: 30, width: 90 }} />
        </div>
      </div>
    </div>
  );
};

export default BlogCardSkeleton;
