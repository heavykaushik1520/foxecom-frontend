import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { mobileModelAPI, adminAPI } from "../../../utils/api";

const MobileModelDashboard = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [selectedModels, setSelectedModels] = useState([]);
    const [pagination, setPagination] = useState({
      page: 1,
      limit: 10,
      totalPages: 1,
      totalItems: 0,
    });
    const [search, setSearch] = useState("");
  
    useEffect(() => {
      fetchModels();
    }, [pagination.page, search]);
  
    const fetchModels = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const params = {
          page: pagination.page,
          limit: pagination.limit,
        };
        if (search) {
          params.search = search;
        }

        const data = await mobileModelAPI.getAll(params);
        // Handle response format
        const modelsList = data.models || (Array.isArray(data) ? data : []);
        setModels(modelsList);
        
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: data.pagination.totalPages || 1,
            totalItems: data.pagination.totalItems || 0,
          }));
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load models");
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this model?\n\nNote: Models with associated case details cannot be deleted.")) {
        return;
      }

      try {
        await adminAPI.deleteMobileModel(id);
        setSuccessMessage("Model deleted successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchModels();
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to delete model. Make sure it has no associated case details.");
        setTimeout(() => setError(""), 5000);
      }
    };

    const handleBulkDelete = async () => {
      if (selectedModels.length === 0) {
        alert("Please select models to delete");
        return;
      }

      if (!window.confirm(`Are you sure you want to delete ${selectedModels.length} model(s)?\n\nNote: Models with associated case details cannot be deleted.`)) {
        return;
      }

      try {
        const result = await adminAPI.bulkDeleteMobileModels(selectedModels);
        if (result.modelsWithDependencies && result.modelsWithDependencies.length > 0) {
          alert(`Some models have dependencies and cannot be deleted:\n${result.modelsWithDependencies.map(m => m.name).join(', ')}`);
        } else {
          setSuccessMessage(`${selectedModels.length} model(s) deleted successfully`);
          setTimeout(() => setSuccessMessage(""), 3000);
        }
        setSelectedModels([]);
        fetchModels();
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to delete models");
        setTimeout(() => setError(""), 5000);
      }
    };

    const handleSelectAll = (e) => {
      if (e.target.checked) {
        setSelectedModels(models.map(m => m.id));
      } else {
        setSelectedModels([]);
      }
    };

    const handleSelectModel = (modelId) => {
      setSelectedModels(prev => 
        prev.includes(modelId) 
          ? prev.filter(id => id !== modelId)
          : [...prev, modelId]
      );
    };


  return (
    <>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h4 className="mb-2 mb-md-0 text-uppercase">Mobile Models</h4>
        <div className="d-flex gap-2">
          {selectedModels.length > 0 && (
            <button
              className="btn btn-danger"
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedModels.length})
            </button>
          )}
          <Link to={"/admin/mobile-model/add"} className="btn btn-primary">
            + Add Model
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search models by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            <div className="col-md-6 text-end">
              {/* Intentionally hide "Showing X of Y models" summary. */}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage("")}
          ></button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}
    
      {/* Content Card */}
      <div className="card shadow-sm">
        <div className="card-body p-3 p-md-4">
          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="mt-3 mb-0 text-muted">Loading models...</p>
            </div>
          )}
    
          {/* Empty */}
          {!loading && !error && models.length === 0 && (
            <div className="text-center py-5 text-muted">
              <p className="mb-2">No models found</p>
              <Link to={"/admin/mobile-model/add"} className="btn btn-sm btn-primary">
                Add Your First Model
              </Link>
            </div>
          )}
    
          {/* Table */}
          {!loading && !error && models.length > 0 && (
            <>
              <div className="d-flex justify-content-end align-items-center mb-3">
                <div>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={selectedModels.length === models.length && models.length > 0}
                    onChange={handleSelectAll}
                  />
                  <small className="text-muted">Select All</small>
                </div>
              </div>
              
              <div className="table-responsive">
                <table className="table align-middle table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40px" }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedModels.length === models.length && models.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th style={{ width: "60px" }}>#</th>
                      <th>Model Name</th>
                      <th>Brand</th>
                      <th>Creation Date</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
    
                  <tbody>
                    {models.map((model, index) => (
                      <tr key={model.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedModels.includes(model.id)}
                            onChange={() => handleSelectModel(model.id)}
                          />
                        </td>
                        <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td className="fw-medium">{model.name}</td>
                        <td>
                          <span className="badge bg-info">
                            {model.mobileBrands?.name || "N/A"}
                          </span>
                        </td>
                        <td className="text-muted small">
                          {new Date(model.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-center">
                          <Link
                            to={`/admin/mobile-model/edit/${model.id}`}
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Edit Model"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(model.id)}
                            title="Delete Model"
                            disabled={model.CaseDetails && model.CaseDetails.length > 0}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div />
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-primary"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default MobileModelDashboard;