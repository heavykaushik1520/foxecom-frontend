import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { ProductListSkeleton } from './LoadingSkeleton';
import ProductCard from './ProductCard';

const LatestProducts = ({ limit = 8 }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productAPI.getAll({
        limit,
        page: 1,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error loading latest products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  if (products.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="latest-products padding-large bg-light">
      <div className="container">
        <div className="row">
          <div className="display-header d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <h2 className="display-7 text-dark text-uppercase mb-0">Latest Arrivals</h2>
            <Link 
              to="/shop" 
              className="btn text-uppercase"
              style={{
                borderColor: '#89bb56',
                color: '#89bb56',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease'
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
          
          {loading ? (
            <ProductListSkeleton count={limit} />
          ) : (
            <div className="row">
              {products.map((product) => {
                const productData = {
                  id: product.id,
                  title: product.title || product.name,
                  price: parseFloat(product.price || 0),
                  discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : null,
                  thumbnailImage: product.thumbnailImage,
                  images: product.images,
                  rating: product.rating || product.averageRating || 0,
                  reviewCount: product.reviewCount || product.reviewsCount || 0,
                  fiveStarCount: product?.ratingSummary?.count5 ?? product?.count5 ?? 0,
                  inStock: product.inStock !== false,
                  category: product.category,
                  sku: product.sku ?? '',
                };

                return (
                  <div key={product.id} className="col-lg-4 col-md-6 col-sm-6 mb-4">
                    <ProductCard
                      product={productData}
                      onAddToCart={handleAddToCart}
                      showAddToCart={true}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestProducts;
