import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsAPI, getImageUrl } from "../../utils/api";

function StatCard({ label, value }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="text-muted small text-uppercase">{label}</div>
          <div className="fs-4 fw-semibold mt-1">{value}</div>
        </div>
      </div>
    </div>
  );
}

function formatInr(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "₹0";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function SalesTable({ title, subtitle, columns, rows, emptyText }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white">
        <div className="fw-semibold">{title}</div>
        {subtitle ? <div className="small text-muted">{subtitle}</div> : null}
      </div>
      <div className="table-responsive">
        <table className="table table-sm table-hover mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.className || ""}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!rows?.length ? (
              <tr>
                <td colSpan={columns.length} className="text-muted text-center py-4">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.rowKey != null ? row.rowKey : idx}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.className || ""}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pages, setPages] = useState([]);
  const [daily, setDaily] = useState([]);
  const [days, setDays] = useState(30);
  const [salesPeriod, setSalesPeriod] = useState("all");
  const [sales, setSales] = useState(null);
  const [salesError, setSalesError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSalesError(null);

      const [s, p, d] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getPages(),
        analyticsAPI.getDaily(days),
      ]);
      setSummary(s);
      setPages(Array.isArray(p) ? p : []);
      setDaily(Array.isArray(d) ? d : []);

      try {
        const salesOpts =
          salesPeriod === "all" ? { limit: 120 } : { days: Number(salesPeriod), limit: 120 };
        const salesData = await analyticsAPI.getSales(salesOpts);
        setSales(salesData && typeof salesData === "object" ? salesData : null);
      } catch (se) {
        if (se?.isAdminTokenError) {
          navigate("/admin/login", { replace: true });
          return;
        }
        setSales(null);
        setSalesError(se?.message || "Could not load sales analytics");
      }
    } catch (err) {
      if (err?.isAdminTokenError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(err?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [days, salesPeriod, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const maxDailyViews = useMemo(() => {
    let m = 1;
    for (const row of daily) {
      const v = Number(row?.totalViews) || 0;
      if (v > m) m = v;
    }
    return m;
  }, [daily]);

  const salesPeriodLabel =
    salesPeriod === "all" ? "All time" : `Last ${salesPeriod} days`;

  const topProductColumns = useMemo(
    () => [
      {
        key: "thumb",
        label: "",
        className: "align-middle",
        render: (row) => (
          <img
            src={getImageUrl(row.thumbnailImage)}
            alt=""
            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
          />
        ),
      },
      {
        key: "productTitle",
        label: "Product",
        render: (row) => (
          <div>
            <div className="fw-medium">{row.productTitle}</div>
            {row.sku ? <div className="small text-muted">SKU: {row.sku}</div> : null}
            <div className="small text-muted">ID: {row.productId}</div>
          </div>
        ),
      },
      { key: "unitsSold", label: "Units", className: "text-end align-middle" },
      { key: "revenue", label: "Revenue", className: "text-end align-middle", render: (r) => formatInr(r.revenue) },
      { key: "orderCount", label: "Orders", className: "text-end align-middle" },
    ],
    []
  );

  const topProductsRows = useMemo(() => {
    const list = sales?.topProducts;
    if (!Array.isArray(list)) return [];
    return list.map((r) => ({ ...r, rowKey: `p-${r.productId}` }));
  }, [sales]);

  if (loading && !summary) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading analytics…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <div>
          <h1 className="h4 mb-0">Website analytics</h1>
          <p className="text-muted small mb-0">Visitors, traffic, and product sales</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <label className="small text-muted mb-0 d-flex align-items-center gap-1">
            Traffic range
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </label>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {summary && (
        <div className="row g-3 mb-4">
          <StatCard label="Total page views" value={summary.totalPageViews ?? 0} />
          <StatCard label="Today — page views" value={summary.todayPageViews ?? 0} />
        </div>
      )}

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 className="h5 mb-0">Sales analytics</h2>
        <label className="small text-muted mb-0 d-flex align-items-center gap-1">
          Order period
          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={salesPeriod}
            onChange={(e) => setSalesPeriod(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 365 days</option>
          </select>
        </label>
      </div>

      {salesError && (
        <div className="alert alert-warning small mb-3">
          {salesError} (traffic metrics above still load.)
        </div>
      )}

      {sales?.totals && (
        <div className="row g-3 mb-4">
          <StatCard label={`Units sold (${salesPeriodLabel})`} value={sales.totals.unitsSold ?? 0} />
          <StatCard label="Revenue (line items)" value={formatInr(sales.totals.revenue)} />
          <StatCard label="Orders with items" value={sales.totals.orderCount ?? 0} />
          <StatCard label="Line items" value={sales.totals.lineItemCount ?? 0} />
        </div>
      )}

      {sales && (
        <div className="mb-4">
          <SalesTable
            title="Top products"
            subtitle="By units sold (non-cancelled orders only)"
            columns={topProductColumns}
            rows={topProductsRows}
            emptyText="No orders yet for this period."
          />
        </div>
      )}

      {sales && (
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <SalesTable
              title="Brand-wise sales"
              subtitle="From product → case details → mobile brand"
              columns={[
                { key: "brandName", label: "Brand" },
                { key: "unitsSold", label: "Units", className: "text-end" },
                { key: "revenue", label: "Revenue", className: "text-end", render: (r) => formatInr(r.revenue) },
                { key: "orderCount", label: "Orders", className: "text-end" },
              ]}
              rows={sales.byBrand || []}
              emptyText="No data."
            />
          </div>
          <div className="col-12 col-lg-6">
            <SalesTable
              title="Model-wise sales"
              subtitle="Phone model (per case details)"
              columns={[
                {
                  key: "model",
                  label: "Model / brand",
                  render: (r) => (
                    <div>
                      <div className="fw-medium">{r.modelName}</div>
                      <div className="small text-muted">{r.brandName}</div>
                    </div>
                  ),
                },
                { key: "unitsSold", label: "Units", className: "text-end" },
                { key: "revenue", label: "Revenue", className: "text-end", render: (r) => formatInr(r.revenue) },
                { key: "orderCount", label: "Orders", className: "text-end" },
              ]}
              rows={(sales.byModel || []).map((r) => ({
                ...r,
                rowKey: `m-${r.modelId}-${r.brandId}`,
              }))}
              emptyText="No data."
            />
          </div>
        </div>
      )}

      {/* Removed: Device / case variant sales block (sales.byDevice) */}

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">Page breakdown</div>
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Page</th>
                    <th className="text-end">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-muted text-center py-4">
                        No visits recorded yet.
                      </td>
                    </tr>
                  ) : (
                    pages.map((row) => (
                      <tr key={row.page}>
                        <td className="text-break font-monospace small">{row.page}</td>
                        <td className="text-end">{row.totalViews ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">Daily traffic ({days} days)</div>
            <div className="card-body">
              {daily.length === 0 ? (
                <p className="text-muted small mb-0">No data for this range.</p>
              ) : (
                <ul className="list-unstyled mb-0" style={{ maxHeight: 420, overflowY: "auto" }}>
                  {daily.map((row) => {
                    const v = Number(row.totalViews) || 0;
                    const pct = Math.round((v / maxDailyViews) * 100);
                    return (
                      <li key={row.date} className="mb-3">
                        <div className="d-flex justify-content-between small">
                          <span className="text-muted">{row.date}</span>
                          <span>
                            <strong>{v}</strong> views
                          </span>
                        </div>
                        <div
                          className="mt-1 rounded-pill bg-light"
                          style={{ height: 8, overflow: "hidden" }}
                          title={`${v} page views`}
                        >
                          <div
                            className="h-100 bg-primary rounded-pill"
                            style={{ width: `${pct}%`, minWidth: v > 0 ? 4 : 0 }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
