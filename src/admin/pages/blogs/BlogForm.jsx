import React, { useEffect, useMemo, useState } from "react";
import { adminAPI, blogAPI, getImageUrl } from "../../../utils/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const MAX_RELATED_PRODUCTS = 10;

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const editorFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "blockquote",
  "list",
  "bullet",
  "link",
  "image",
];

const BlogForm = ({ initialData, onSubmit, submitting, mode = "create" }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [localError, setLocalError] = useState("");

  const [form, setForm] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    contentHtml: initialData?.contentHtml || "",
    featuredImageAlt: initialData?.featuredImageAlt || "",
    videoUrl: initialData?.videoUrl || "",
    authorName: initialData?.authorName || "",
    status: initialData?.status || "draft",
    isFeatured: Boolean(initialData?.isFeatured),
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    seoKeywords: initialData?.seoKeywords || "",
    canonicalUrl: initialData?.canonicalUrl || "",
    tagsText: (initialData?.tags || []).map((t) => t.name).join(", "),
    relatedProductIds: (initialData?.relatedProducts || [])
      .slice()
      .sort((a, b) => (a?.BlogRelatedProduct?.sortOrder || 0) - (b?.BlogRelatedProduct?.sortOrder || 0))
      .map((p) => p.id),
  });
  const [featuredImageFile, setFeaturedImageFile] = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoadingProducts(true);
        const data = await adminAPI.getAllProductsForAdmin({
          page: 1,
          limit: 30,
          sortBy: "createdAt",
          sortOrder: "DESC",
          search: productQuery || undefined,
        });
        setProducts(data?.products || []);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [productQuery]);

  const generatedSlug = useMemo(() => {
    if (!form.title) return "";
    return form.title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }, [form.title]);

  const effectiveSlug = form.slug || generatedSlug;

  const handlePreview = async () => {
    if (!initialData?.id) return;
    try {
      setLoadingPreview(true);
      const res = await blogAPI.adminGetPreview(initialData.id);
      setPreviewData(res?.preview || null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const selectedProducts = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return form.relatedProductIds
      .map((id) => map.get(id) || { id, title: `Product #${id}` })
      .filter(Boolean);
  }, [products, form.relatedProductIds]);

  const filteredProducts = useMemo(() => products, [products]);

  const addRelatedProduct = (productId) => {
    setLocalError("");
    setForm((s) => {
      if (s.relatedProductIds.includes(productId)) return s;
      if (s.relatedProductIds.length >= MAX_RELATED_PRODUCTS) {
        setLocalError(`You can attach maximum ${MAX_RELATED_PRODUCTS} related products.`);
        return s;
      }
      return { ...s, relatedProductIds: [...s.relatedProductIds, productId] };
    });
  };

  const removeRelatedProduct = (productId) => {
    setForm((s) => ({ ...s, relatedProductIds: s.relatedProductIds.filter((id) => id !== productId) }));
  };

  const moveRelatedProduct = (productId, direction) => {
    setForm((s) => {
      const current = [...s.relatedProductIds];
      const idx = current.indexOf(productId);
      if (idx < 0) return s;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= current.length) return s;
      [current[idx], current[target]] = [current[target], current[idx]];
      return { ...s, relatedProductIds: current };
    });
  };

  const submitForm = (e) => {
    e.preventDefault();
    setLocalError("");
    if (form.relatedProductIds.length > MAX_RELATED_PRODUCTS) {
      setLocalError(`You can attach maximum ${MAX_RELATED_PRODUCTS} related products.`);
      return;
    }
    const payload = {
      ...form,
      slug: effectiveSlug,
      tags: form.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      relatedProductIds: form.relatedProductIds,
      featuredImageFile,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={submitForm}>
      {localError && <div className="alert alert-danger mb-3">{localError}</div>}
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm mb-3">
            <div className="card-header"><strong>Content</strong></div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Slug *</label>
                <input className="form-control" value={effectiveSlug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Excerpt</label>
                <textarea className="form-control" rows="3" value={form.excerpt} onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))} />
              </div>
              <div className="mb-0">
                <label className="form-label">Main Content *</label>
                <ReactQuill
                  theme="snow"
                  value={form.contentHtml}
                  onChange={(html) => setForm((s) => ({ ...s, contentHtml: html }))}
                  modules={editorModules}
                  formats={editorFormats}
                />
              </div>
            </div>
          </div>

          <div className="card shadow-sm mb-3">
            <div className="card-header"><strong>Media</strong></div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Featured Image</label>
                <input type="file" accept="image/*" className="form-control" onChange={(e) => setFeaturedImageFile(e.target.files?.[0] || null)} />
                {!featuredImageFile && initialData?.featuredImage && (
                  <img src={getImageUrl(initialData.featuredImage)} alt={initialData.featuredImageAlt || initialData.title} className="img-fluid mt-2 rounded" style={{ maxHeight: 180 }} />
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Featured Image Alt</label>
                <input className="form-control" value={form.featuredImageAlt} onChange={(e) => setForm((s) => ({ ...s, featuredImageAlt: e.target.value }))} />
              </div>
              <div className="mb-0">
                <label className="form-label">Video URL (YouTube/Vimeo)</label>
                <input className="form-control" value={form.videoUrl} onChange={(e) => setForm((s) => ({ ...s, videoUrl: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm mb-3">
            <div className="card-header"><strong>Publish</strong></div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((s) => ({ ...s, isFeatured: e.target.checked }))} />
                <label className="form-check-label">Featured Blog</label>
              </div>
              <div className="mb-3">
                <label className="form-label">Author</label>
                <input className="form-control" value={form.authorName} onChange={(e) => setForm((s) => ({ ...s, authorName: e.target.value }))} />
              </div>
              <button className="btn btn-primary w-100" disabled={submitting}>
                {submitting ? "Saving..." : mode === "edit" ? "Update Blog" : "Create Blog"}
              </button>
              {mode === "edit" && (
                <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={handlePreview} disabled={loadingPreview}>
                  {loadingPreview ? "Loading Preview..." : "Preview Draft"}
                </button>
              )}
            </div>
          </div>

          <div className="card shadow-sm mb-3">
            <div className="card-header"><strong>SEO</strong></div>
            <div className="card-body">
              <div className="mb-2"><input className="form-control" placeholder="SEO Title" value={form.seoTitle} onChange={(e) => setForm((s) => ({ ...s, seoTitle: e.target.value }))} /></div>
              <div className="mb-2"><textarea className="form-control" rows="3" placeholder="SEO Description" value={form.seoDescription} onChange={(e) => setForm((s) => ({ ...s, seoDescription: e.target.value }))} /></div>
              <div className="mb-2"><input className="form-control" placeholder="SEO Keywords (comma separated)" value={form.seoKeywords} onChange={(e) => setForm((s) => ({ ...s, seoKeywords: e.target.value }))} /></div>
              <div><input className="form-control" placeholder="Canonical URL" value={form.canonicalUrl} onChange={(e) => setForm((s) => ({ ...s, canonicalUrl: e.target.value }))} /></div>
            </div>
          </div>

          <div className="card shadow-sm mb-3">
            <div className="card-header"><strong>Tags & Products</strong></div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-control" value={form.tagsText} onChange={(e) => setForm((s) => ({ ...s, tagsText: e.target.value }))} />
              </div>
              <div>
                <label className="form-label d-flex justify-content-between">
                  <span>Related Products</span>
                  <small className="text-muted">{form.relatedProductIds.length}/{MAX_RELATED_PRODUCTS}</small>
                </label>

                <input
                  className="form-control mb-2"
                  placeholder="Search product by title or ID"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                />

                <div className="border rounded p-2 mb-2" style={{ maxHeight: 180, overflowY: "auto" }}>
                  {loadingProducts ? (
                    <small className="text-muted">Loading products...</small>
                  ) : filteredProducts.length === 0 ? (
                    <small className="text-muted">No products found.</small>
                  ) : (
                    filteredProducts.map((p) => {
                      const selected = form.relatedProductIds.includes(p.id);
                      return (
                        <div key={p.id} className="d-flex align-items-center justify-content-between py-1 border-bottom">
                          <small className="me-2 text-truncate">{p.title}</small>
                          <button
                            type="button"
                            className={`btn btn-sm ${selected ? "btn-outline-secondary" : "btn-outline-primary"}`}
                            onClick={() => (selected ? removeRelatedProduct(p.id) : addRelatedProduct(p.id))}
                          >
                            {selected ? "Remove" : "Add"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="d-flex flex-column gap-2">
                  {selectedProducts.length === 0 ? (
                    <small className="text-muted">No related products selected.</small>
                  ) : (
                    selectedProducts.map((p, idx) => (
                      <div key={p.id} className="d-flex align-items-center gap-2 border rounded p-2">
                        <img
                          src={getImageUrl(p.thumbnailImage)}
                          alt={p.title}
                          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                        />
                        <div className="flex-grow-1">
                          <small className="fw-semibold d-block text-truncate">{p.title}</small>
                          <small className="text-muted">#{idx + 1}</small>
                        </div>
                        <div className="btn-group btn-group-sm">
                          <button type="button" className="btn btn-outline-secondary" onClick={() => moveRelatedProduct(p.id, "up")} disabled={idx === 0}>↑</button>
                          <button type="button" className="btn btn-outline-secondary" onClick={() => moveRelatedProduct(p.id, "down")} disabled={idx === selectedProducts.length - 1}>↓</button>
                          <button type="button" className="btn btn-outline-danger" onClick={() => removeRelatedProduct(p.id)}>✕</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewData && (
        <div className="card shadow-sm mt-3">
          <div className="card-header"><strong>Preview</strong></div>
          <div className="card-body">
            <h5>{previewData.title}</h5>
            <div dangerouslySetInnerHTML={{ __html: previewData.contentHtml }} />
          </div>
        </div>
      )}
    </form>
  );
};

export default BlogForm;
