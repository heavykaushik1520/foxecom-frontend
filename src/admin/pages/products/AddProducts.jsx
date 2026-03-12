import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryAPI, API_BASE_URL } from "../../../utils/api";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const AddProduct = () => {
  const navigate = useNavigate();

  /* =====================
     FORM STATES
  ====================== */
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================
     FETCH CATEGORIES
  ====================== */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");
        const data = await categoryAPI.getAll();
        // Handle both new format (with success) and legacy format
        const categoriesList = data.categories || data;
        setCategories(Array.isArray(categoriesList) ? categoriesList : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  /* =====================
     FILE HANDLERS
  ====================== */
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

  /* =====================
     SUBMIT PRODUCT
  ====================== */
  const stripHtml = (html) =>
    typeof html === "string" ? html.replace(/<[^>]*>/g, "").trim() : "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !categoryId || !price || !thumbnail) {
      setError("Please fill all required fields");
      return;
    }

    if (images.length < 2 || images.length > 10) {
      setError("Please upload between 2 and 10 gallery images");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      const formData = new FormData();
      // Store plain text for title to keep it clean
      formData.append("title", stripHtml(title));
      formData.append("categoryId", categoryId);
      formData.append("price", price);
      formData.append("discountPrice", discountPrice);
      formData.append("stock", stock);
      formData.append("sku", sku);
      formData.append("description", description);
      formData.append("thumbnailImage", thumbnail);

      images.forEach((img) => {
        formData.append("images", img);
      });

      const res = await fetch(
        `${API_BASE_URL}/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Product creation failed");
      }

      setSuccess("Product created successfully");

      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     UI
  ====================== */
  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-9 col-md-10">
          <div className="card shadow border-0">
            <div className="card-body p-4">
              <h4 className="mb-3 fw-bold">Add Product</h4>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row g-3">
                  <div className="col-12 col-md-8">
                    <label className="form-label">Title *</label>
                    <div
                      data-color-mode="light"
                      className="border rounded"
                      style={{ minHeight: 100 }}
                    >
                      <MDEditor
                        value={title}
                        onChange={(val) => setTitle(val || "")}
                        preview="edit"
                        height={140}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      disabled={loadingCategories}
                    >
                      <option value="">
                        {loadingCategories ? "Loading categories..." : "Select Category"}
                      </option>
                      {Array.isArray(categories) && categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {!loadingCategories && categories.length === 0 && (
                      <small className="text-muted">No categories available. Please add categories first.</small>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Price *</label>
                    <input
                      className="form-control"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Discount Price</label>
                    <input
                      className="form-control"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Stock</label>
                    <input
                      className="form-control"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">SKU</label>
                    <input
                      className="form-control"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Thumbnail *</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Gallery Images (2–10) *
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={handleImagesChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <div data-color-mode="light">
                      <MDEditor
                        value={description}
                        onChange={(val) => setDescription(val || "")}
                        preview="edit"
                        height={200}
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <div className="col-12 d-flex gap-2 mt-3">
                     <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                  >
                    {loading ? "Uploading..." : "Create Product"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>

                  </div>
                 

                  {/* <div className="col-12 d-flex gap-2 mt-3">
         
         
        </div> */}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
