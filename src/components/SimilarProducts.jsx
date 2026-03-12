import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, reviewAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { ProductListSkeleton } from './LoadingSkeleton';
import ProductCard from './ProductCard';

const SimilarProducts = ({ product, limit = 8 }) => {
  const { addToCart } = useCart();
  const [similarProducts, setSimilarProducts] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (product) {
      loadSimilarProducts();
    }
  }, [product?.id]);

  const loadSimilarProducts = async () => {
    try {
      setLoading(true);
      
      // Build filter parameters based on product attributes
      const filters = {};
      
      // Filter by category if available
      if (product.category?.id) {
        filters.categoryId = product.category.id;
      }
      
      // Filter by model if caseDetails has model
      if (product.caseDetails?.model?.id) {
        filters.modelId = product.caseDetails.model.id;
      }
      
      // Filter by color if caseDetails has color
      if (product.caseDetails?.color) {
        filters.color = product.caseDetails.color;
      }
      
      // Filter by case type if available
      if (product.caseDetails?.caseType) {
        filters.caseType = product.caseDetails.caseType;
      }
      
      // Get products with filters, excluding current product
      const params = {
        ...filters,
        limit: limit + 1, // Get one extra to exclude current product
        page: 1,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
      
      const productsData = await productAPI.getAll(params);
      const products = Array.isArray(productsData) ? productsData : [];
      
      // Filter out current product and limit results
      const filtered = products
        .filter(p => p.id !== product.id)
        .slice(0, limit);
      
      // If we don't have enough similar products, try broader filters
      if (filtered.length < limit) {
        const broaderFilters = {};
        
        // Try just category
        if (product.category?.id) {
          broaderFilters.categoryId = product.category.id;
        }
        
        // Try just model
        if (product.caseDetails?.model?.id && !broaderFilters.categoryId) {
          broaderFilters.modelId = product.caseDetails.model.id;
        }
        
        // Get more products with broader filters
        const broaderParams = {
          ...broaderFilters,
          limit: limit + 1,
          page: 1,
        };
        
        const broaderData = await productAPI.getAll(broaderParams);
        const broaderProducts = Array.isArray(broaderData) ? broaderData : [];
        
        // Combine and deduplicate
        const combined = [
          ...filtered,
          ...broaderProducts.filter(
            p => p.id !== product.id && !filtered.find(f => f.id === p.id)
          )
        ].slice(0, limit);
        
        setSimilarProducts(combined);
      } else {
        setSimilarProducts(filtered);
      }
    } catch (error) {
      console.error('Error loading similar products:', error);
      setSimilarProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (similarProducts.length === 0) return;
    const fetchRatings = async () => {
      try {
        const entries = await Promise.all(
          similarProducts.map(async (p) => {
            try {
              const data = await reviewAPI.getByProduct(p.id);
              return [p.id, { averageRating: data.averageRating || 0, reviewCount: data.totalCount ?? data.reviews?.length ?? 0 }];
            } catch {
              return [p.id, { averageRating: 0, reviewCount: 0 }];
            }
          })
        );
        setRatingsMap(Object.fromEntries(entries));
      } catch (err) {
        console.error('Failed to load ratings for similar products', err);
      }
    };
    fetchRatings();
  }, [similarProducts]);

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  if (loading) {
    return (
      <section className="similar-products padding-large bg-light">
        <div className="container">
          <div className="row">
            <div className="display-header d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <h2 className="display-7 text-dark text-uppercase mb-0">You May Also Like</h2>
            </div>
            <ProductListSkeleton count={limit} />
          </div>
        </div>
      </section>
    );
  }

  if (similarProducts.length === 0) {
    return null; // Don't show section if no similar products
  }

  return (
    <section className="similar-products padding-large bg-light">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="display-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 gap-sm-3 mb-3 mb-md-4 pb-3 border-bottom">
              <h2 className="display-7 text-dark text-uppercase mb-0" style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)" }}>
                Similar Products
              </h2>
              <Link 
                to="/shop" 
                className="btn text-uppercase"
                style={{
                  borderColor: '#89bb56',
                  color: '#89bb56',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease',
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  padding: '0.5rem 1.25rem',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#89bb56';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#89bb56';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#89bb56';
                  e.currentTarget.style.borderColor = '#89bb56';
                }}
              >
                View All
              </Link>
            </div>
          </div>
          
          <div className="col-12">
            <div className="row">
              {similarProducts.map((similarProduct) => {
                const productData = {
                  id: similarProduct.id,
                  title: similarProduct.title || similarProduct.name,
                  price: parseFloat(similarProduct.price || 0),
                  discountPrice: similarProduct.discountPrice 
                    ? parseFloat(similarProduct.discountPrice) 
                    : null,
                  thumbnailImage: similarProduct.thumbnailImage,
                  images: similarProduct.images,
                  rating: ratingsMap[similarProduct.id]?.averageRating ?? similarProduct.rating ?? similarProduct.averageRating ?? 0,
                  reviewCount: ratingsMap[similarProduct.id]?.reviewCount ?? similarProduct.reviewCount ?? similarProduct.reviewsCount ?? 0,
                  inStock: similarProduct.inStock !== false,
                  category: similarProduct.category,
                  sku: similarProduct.sku ?? '',
                };

                return (
                  <div key={similarProduct.id} className="col-12 col-md-6 col-lg-3 mb-3 mb-md-4">
                    <ProductCard
                      product={productData}
                      onAddToCart={handleAddToCart}
                      showAddToCart={true}
                       showBuyNow={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimilarProducts;
