import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { productAPI, categoryAPI, adminAPI, getImageUrl } from "../../../utils/api";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const newImagePreviewUrlsRef = useRef([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  // Create/revoke object URLs for new image previews to avoid memory leaks
  if (images.length !== newImagePreviewUrlsRef.current.length || images.some((f, i) => newImagePreviewUrlsRef.current[i]?.file !== f)) {
    newImagePreviewUrlsRef.current.forEach((o) => URL.revokeObjectURL(o.url));
    newImagePreviewUrlsRef.current = images.map((file) => ({ file, url: URL.createObjectURL(file) }));
  }
  useEffect(() => {
    return () => newImagePreviewUrlsRef.current.forEach((o) => URL.revokeObjectURL(o.url));
  }, []);

  const fetchData = async () => {
    try {
      setFetching(true);
      setError("");
      const [productData, categoriesData] = await Promise.all([
        productAPI.getById(id),
        categoryAPI.getAll(),
      ]);

      const product = productData.product || productData;
      setTitle(product.title || "");
      setCategoryId(product.categoryId || "");
      setPrice(product.price || "");
      setDiscountPrice(product.discountPrice || "");
      setStock(product.stock || "");
      setSku(product.sku || "");
      setSlug(product.slug || "");
      setDescription(product.description || "");
      setExistingImages(product.images || []);

      // Handle both new format (with success) and legacy format
      const categoriesList = categoriesData.categories || categoriesData;
      setCategories(Array.isArray(categoriesList) ? categoriesList : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load product");
    } finally {
      setFetching(false);
    }
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    // Remove duplicate files by name and size
    const uniqueFiles = [];
    const seen = new Set();
    
    files.forEach(file => {
      const key = `${file.name}-${file.size}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueFiles.push(file);
      }
    });
    
    setImages(uniqueFiles);
  };

  const handleDeleteImage = (imageId) => {
    if (imagesToDelete.includes(imageId)) return;
    setImagesToDelete([...imagesToDelete, imageId]);
  };

  const handleRestoreImage = (imageId) => {
    setImagesToDelete(imagesToDelete.filter((id) => id !== imageId));
  };

  const removeNewImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const currentGalleryCount = existingImages.length - imagesToDelete.length + images.length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !categoryId || !price) {
      setError("Title, category, and price are required.");
      return;
    }

    if (currentGalleryCount < 2 || currentGalleryCount > 10) {
      setError("Product must have between 2 and 10 gallery images. Current total: " + currentGalleryCount + ".");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("categoryId", categoryId);
      formData.append("price", price);
      if (discountPrice) formData.append("discountPrice", discountPrice);
      if (stock) formData.append("stock", stock);
      if (sku) formData.append("sku", sku);
      formData.append("slug", slug.trim());
      if (description) formData.append("description", description);

      if (thumbnail) {
        formData.append("thumbnailImage", thumbnail);
      }

      if (images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      if (imagesToDelete.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      await adminAPI.updateProduct(id, formData);

      setSuccess("Product updated successfully");
      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Edit Product</h4>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/products")}
        >
          Back to Products
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="categoryId" className="form-label">
                    Category *
                  </label>
                  <select
                    className="form-select"
                    id="categoryId"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    disabled={fetching}
                  >
                    <option value="">
                      {fetching ? "Loading categories..." : "Select a category"}
                    </option>
                    {Array.isArray(categories) && categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {!fetching && categories.length === 0 && (
                    <small className="text-muted">No categories available. Please add categories first.</small>
                  )}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="discountPrice" className="form-label">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="discountPrice"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="stock" className="form-label">
                    Stock
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="stock"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="sku" className="form-label">
                    SKU
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="slug" className="form-label">
                    URL slug
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. leather-case-iphone-15"
                    autoComplete="off"
                  />
                  <small className="text-muted">
                    Lowercase letters, numbers, hyphens. Clear to remove slug (storefront will use numeric ID).
                  </small>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <div data-color-mode="light">
                <MDEditor
                  value={description}
                  onChange={(val) => setDescription(val || "")}
                  preview="edit"
                  height={200}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="thumbnail" className="form-label">
                Thumbnail Image (leave blank to keep current)
              </label>
              <input
                type="file"
                className="form-control"
                id="thumbnail"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {!thumbnail && existingImages.length > 0 && (
                <small className="form-text text-muted">
                  Current thumbnail will be kept
                </small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Gallery Images (2–10 images required)
              </label>
              <div className="mb-2">
                <input
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImagesChange}
                />
                <small className="form-text text-muted">
                  Keep: {existingImages.length - imagesToDelete.length} · New: {images.length} · Total: {currentGalleryCount}. Max 10 images, 20MB each.
                </small>
                {(currentGalleryCount < 2 || currentGalleryCount > 10) && (
                  <div className="text-danger small mt-1">
                    {currentGalleryCount < 2 ? "Add more images or restore some so you have at least 2." : "Remove or un-select images so you have at most 10."}
                  </div>
                )}
              </div>

              {existingImages.filter((img) => !imagesToDelete.includes(img.id)).length > 0 && (
                <div className="mt-2">
                  <strong className="small text-muted">Current gallery (click × to remove)</strong>
                  <div className="row g-2 mt-1">
                    {existingImages
                      .filter((img) => !imagesToDelete.includes(img.id))
                      .map((image) => (
                        <div key={image.id} className="col-3">
                          <div className="position-relative">
                            <img
                              src={getImageUrl(image.imageUrl)}
                              alt="Product"
                              className="img-thumbnail"
                              style={{ width: "100%", height: "100px", objectFit: "cover" }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              onClick={() => handleDeleteImage(image.id)}
                              title="Remove from product"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {imagesToDelete.length > 0 && (
                <div className="mt-2">
                  <strong className="small text-muted">Removed (click Restore to keep)</strong>
                  <div className="row g-2 mt-1">
                    {existingImages
                      .filter((img) => imagesToDelete.includes(img.id))
                      .map((image) => (
                        <div key={image.id} className="col-3">
                          <div className="position-relative opacity-75">
                            <img
                              src={getImageUrl(image.imageUrl)}
                              alt="Removed"
                              className="img-thumbnail"
                              style={{ width: "100%", height: "100px", objectFit: "cover" }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-success position-absolute top-0 end-0"
                              onClick={() => handleRestoreImage(image.id)}
                              title="Restore image"
                            >
                              Restore
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {images.length > 0 && (
                <div className="mt-2">
                  <strong className="small text-muted">New images (click × to remove from upload)</strong>
                  <div className="row g-2 mt-1">
                    {images.map((file, index) => (
                      <div key={`new-${index}-${file.name}`} className="col-3">
                        <div className="position-relative">
                          <img
                            src={newImagePreviewUrlsRef.current[index]?.url || ""}
                            alt={`New ${index + 1}`}
                            className="img-thumbnail"
                            style={{ width: "100%", height: "100px", objectFit: "cover" }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            onClick={() => removeNewImage(index)}
                            title="Remove from upload"
                          >
                            ×
                          </button>
                          <small className="d-block text-muted text-truncate" style={{ maxWidth: "100%" }}>{file.name}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Product"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/admin/products")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
