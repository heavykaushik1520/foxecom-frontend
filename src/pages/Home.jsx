import React, { useEffect, useState, Suspense, lazy } from 'react'
import Billboard from '../components/Billboard'
import { categoryAPI } from '../utils/api'

// Lazy-load heavy, below-the-fold homepage sections
const BuyOneGetOne = lazy(() => import('../components/BuyOneGetOne'))
const DealOfTheWeek = lazy(() => import('../components/DealOfTheWeek'))
const FeaturedProducts = lazy(() => import('../components/FeaturedProducts'))
const MobileProducts = lazy(() => import('../components/MobileProducts'))
const BestSellers = lazy(() => import('../components/BestSellers'))

const Home = () => {
  const [mobileCategoryId, setMobileCategoryId] = useState(null)

  useEffect(() => {
    // Find mobile/case category for featured products
    const loadCategory = async () => {
      try {
        const data = await categoryAPI.getAll()
        // Handle both new format (with categories property) and legacy format (direct array)
        const categories = Array.isArray(data) ? data : (data?.categories || [])
        
        const mobileCategory = categories.find(cat => 
          cat.name && (
            cat.name.toLowerCase().includes('mobile') || 
            cat.name.toLowerCase().includes('case') ||
            cat.name.toLowerCase().includes('phone')
          )
        )
        if (mobileCategory) {
          setMobileCategoryId(mobileCategory.id)
        }
      } catch (error) {
        console.error('Error loading category:', error)
        // Silently fail - featured products will show all products
      }
    }
    loadCategory()
  }, [])

  return (
    <>
      <Billboard />
      {/* <CompanyServices /> */}

      {/* Buy One Get One Section - Only shows if active */}
      <Suspense fallback={null}>
        <BuyOneGetOne />
      </Suspense>

      {/* Deal of the Week Section - Only shows if active */}
      <Suspense fallback={null}>
        <DealOfTheWeek />
      </Suspense>
      
      {/* Featured Products Section */}
      <Suspense fallback={null}>
        <FeaturedProducts 
          title="Featured Products" 
          limit={8}
          showViewAll={true}
        />
      </Suspense>
      
      {/* Mobile Products Carousel */}
      <Suspense fallback={null}>
        <MobileProducts />
      </Suspense>
      
      {/* Best Sellers Section */}
      <Suspense fallback={null}>
        <BestSellers limit={8} />
      </Suspense>
      
      {/* Latest Arrivals */}
      {/* <LatestProducts limit={8} /> */}
      
      {/* Smart Watches (if available) */}
      {/* <SmartWatches /> */}
      
      {/* Yearly Sale Banner */}
      {/* <YearlySale /> */}
      
      {/* Testimonials */}
      {/* <Testimonials /> */}
      
      {/* Newsletter Subscription */}
      {/* <Subscribe /> */}
      
      {/* Instagram Feed */}
      {/* <Instagram /> */}
    </>
  )
}

export default Home
