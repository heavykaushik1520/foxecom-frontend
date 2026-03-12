import React from 'react';

/**
 * Loading skeleton for product cards
 */
export const ProductCardSkeleton = () => {
  return (
    <div className="card product-card h-100">
      <div className="position-relative">
        <div className="skeleton-image" style={{ 
          height: '250px', 
          backgroundColor: '#e9ecef',
          borderRadius: '0.375rem 0.375rem 0 0'
        }} />
      </div>
      <div className="card-body">
        <div className="skeleton-line mb-2" style={{ 
          height: '20px', 
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          width: '80%'
        }} />
        <div className="skeleton-line mb-2" style={{ 
          height: '16px', 
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          width: '60%'
        }} />
        <div className="skeleton-line mb-3" style={{ 
          height: '24px', 
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          width: '40%'
        }} />
        <div className="d-flex gap-2">
          <div className="skeleton-line" style={{ 
            height: '38px', 
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            flex: 1
          }} />
        </div>
      </div>
    </div>
  );
};

/**
 * Loading skeleton for product list
 */
export const ProductListSkeleton = ({ count = 12 }) => {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="col-6 col-md-4 col-lg-3">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};

/**
 * Loading skeleton for table rows
 */
export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index}>
          <div className="skeleton-line" style={{ 
            height: '20px', 
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            width: '80%'
          }} />
        </td>
      ))}
    </tr>
  );
};

/**
 * Loading skeleton for admin dashboard cards
 */
export const DashboardCardSkeleton = () => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body p-3 p-md-4">
        <div className="skeleton-line mb-2" style={{ 
          height: '16px', 
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          width: '60%'
        }} />
        <div className="skeleton-line mb-3" style={{ 
          height: '40px', 
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          width: '40%'
        }} />
        <div className="skeleton-line" style={{ 
          height: '38px', 
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          width: '100%'
        }} />
      </div>
    </div>
  );
};

/**
 * Generic loading spinner component
 */
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  return (
    <div className={`spinner-border ${sizeClasses[size]} ${className}`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

/**
 * Full page loading component
 */
export const FullPageLoader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-muted">Loading...</p>
      </div>
    </div>
  );
};

export default {
  ProductCardSkeleton,
  ProductListSkeleton,
  TableRowSkeleton,
  DashboardCardSkeleton,
  LoadingSpinner,
  FullPageLoader,
};
