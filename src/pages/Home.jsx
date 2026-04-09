import React, { Suspense, lazy } from 'react'
import Billboard from '../components/Billboard'

// Lazy-load heavy, below-the-fold homepage sections
const BuyOneGetOne = lazy(() => import('../components/BuyOneGetOne'))
const DealOfTheWeek = lazy(() => import('../components/DealOfTheWeek'))
const FeaturedProducts = lazy(() => import('../components/FeaturedProducts'))
const FoxcomOriginals = lazy(() => import('../components/FoxcomOriginals'))
const SamsungProducts = lazy(() => import('../components/SamsungProducts'))
const BestSellers = lazy(() => import('../components/BestSellers'))

const Home = () => {
  return (
    <>
      <h1 className="visually-hidden">
        FOXECOM — Premium iPhone cases, phone covers, and electronics accessories
      </h1>
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

      {/* FOXECOM Originals Section */}
      <Suspense fallback={null}>
        <FoxcomOriginals />
      </Suspense>
      
      {/* Samsung Case Section */}
      <Suspense fallback={null}>
        <SamsungProducts />
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
