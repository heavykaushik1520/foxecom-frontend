import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SearchPopupProvider } from "./contexts/SearchPopupContext";
import { CartProvider } from "./contexts/CartContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { FullPageLoader } from "./components/LoadingSkeleton";
import ScrollToTop from "./components/ScrollToTop";
import { APP_CONFIG, STORAGE_KEYS } from "./utils/constants";
import { useTrackPageVisit } from "./hooks/useTrackPageVisit";
import { useVisitorHeartbeat } from "./hooks/useVisitorHeartbeat";

// Critical components - loaded immediately
import UserLayout from "./components/UserLayout";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import Layout from "./admin/Layout";

// Lazy load user pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Auth = lazy(() => import("./pages/Auth"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const DisclaimerPage = lazy(() => import("./components/DisclaimerPage"));
const DealOfTheWeekPage = lazy(() => import("./pages/DealOfTheWeekPage"));
const BlogsPage = lazy(() => import("./pages/BlogsPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));

// Lazy load admin pages for code splitting
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const CategoryDashboard = lazy(() => import("./admin/pages/CategoryDashboard"));
const AddCategory = lazy(() => import("./admin/pages/AddCategory"));
const EditCategory = lazy(() => import("./admin/pages/EditCategory"));
const MobileBrandDashboard = lazy(() => import("./admin/pages/mobileBrand/mobileBrandDashboard"));
const AddMobileBrand = lazy(() => import("./admin/pages/mobileBrand/addMobileBrand"));
const MobileBrandDetails = lazy(() => import("./admin/pages/mobileBrand/mobileBrandDetails"));
const EditMobileBrand = lazy(() => import("./admin/pages/mobileBrand/EditMobileBrand"));
const MobileModelDashboard = lazy(() => import("./admin/pages/mobileModel/MobileModelDashboard.jsx"));
const AddMobileModel = lazy(() => import("./admin/pages/mobileModel/AddMobileModel"));
const EditMobileModel = lazy(() => import("./admin/pages/mobileModel/EditMobileModel"));
const ProductsDashboard = lazy(() => import("./admin/pages/products/ProductsDashboard"));
const AddProduct = lazy(() => import("./admin/pages/products/AddProducts"));
const ProductView = lazy(() => import("./admin/pages/products/ProductView"));
const EditProduct = lazy(() => import("./admin/pages/products/EditProduct"));
const MobileCase = lazy(() => import("./admin/pages/caseDetails/MobileCase"));
const AddMobileCase = lazy(() => import("./admin/pages/caseDetails/AddMobileCase"));
const EditMobileCase = lazy(() => import("./admin/pages/caseDetails/EditMobileCase"));
const OrdersDashboard = lazy(() => import("./admin/pages/orders/OrdersDashboard"));
const OrderView = lazy(() => import("./admin/pages/orders/OrderView"));
const UsersDashboard = lazy(() => import("./admin/pages/users/UsersDashboard"));
const UserView = lazy(() => import("./admin/pages/users/UserView"));
const AdminsDashboard = lazy(() => import("./admin/pages/admins/AdminsDashboard"));
const AddAdmin = lazy(() => import("./admin/pages/admins/AddAdmin"));
const EditAdmin = lazy(() => import("./admin/pages/admins/EditAdmin"));
const BannersDashboard = lazy(() => import("./admin/pages/banners/BannersDashboard"));
const AddBanner = lazy(() => import("./admin/pages/banners/AddBanner"));
const EditBanner = lazy(() => import("./admin/pages/banners/EditBanner"));
const DealOfTheWeekDashboard = lazy(() => import("./admin/pages/dealOfTheWeek/DealOfTheWeekDashboard"));
const AddDealOfTheWeek = lazy(() => import("./admin/pages/dealOfTheWeek/AddDealOfTheWeek"));
const EditDealOfTheWeek = lazy(() => import("./admin/pages/dealOfTheWeek/EditDealOfTheWeek"));
const BuyOneGetOneDashboard = lazy(() => import("./admin/pages/buyOneGetOne/BuyOneGetOneDashboard"));
const AddBuyOneGetOne = lazy(() => import("./admin/pages/buyOneGetOne/AddBuyOneGetOne"));
const EditBuyOneGetOne = lazy(() => import("./admin/pages/buyOneGetOne/EditBuyOneGetOne"));
const FoxcomOriginalsDashboard = lazy(() => import("./admin/pages/foxcomOriginals/FoxcomOriginalsDashboard"));
const AddFoxcomOriginals = lazy(() => import("./admin/pages/foxcomOriginals/AddFoxcomOriginals"));
const EditFoxcomOriginals = lazy(() => import("./admin/pages/foxcomOriginals/EditFoxcomOriginals"));
const ProductReviews = lazy(() => import("./admin/pages/reviews/ProductReviews"));
const SellerReviewsDashboard = lazy(() => import("./admin/pages/sellerReviews/SellerReviewsDashboard"));
const SellerReviewsByProduct = lazy(() => import("./admin/pages/sellerReviews/SellerReviewsByProduct"));
const AddSellerReview = lazy(() => import("./admin/pages/sellerReviews/AddSellerReview"));
const EditSellerReview = lazy(() => import("./admin/pages/sellerReviews/EditSellerReview"));
const SuperAdminProtectedRoute = lazy(() => import("./admin/SuperAdminProtectedRoute"));
const SuperAdminLayout = lazy(() => import("./admin/SuperAdminLayout"));
const SuperAdminDashboard = lazy(() => import("./admin/SuperAdminDashboard"));
const CreateSuperAdmin = lazy(() => import("./admin/CreateSuperAdmin"));
const AnalyticsDashboard = lazy(() => import("./admin/pages/AnalyticsDashboard"));
const BlogsDashboard = lazy(() => import("./admin/pages/blogs/BlogsDashboard"));
const AddBlog = lazy(() => import("./admin/pages/blogs/AddBlog"));
const EditBlog = lazy(() => import("./admin/pages/blogs/EditBlog"));

function AnalyticsPageTracker() {
  useTrackPageVisit();
  return null;
}

function VisitorHeartbeatTracker() {
  useVisitorHeartbeat();
  return null;
}

// Fires Meta Pixel PageView on every route change (skips admin routes).
const MetaPixelPageTracker = () => {
  const location = useLocation();

  const { pathname, search } = location;

  useEffect(() => {
    const isAdminRoute =
      pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      pathname === "/superadmin" ||
      pathname.startsWith("/superadmin/");

    if (isAdminRoute) return;
    if (typeof window === "undefined") return;
    if (typeof window.fbq !== "function") return;

    window.fbq("track", "PageView");
  }, [pathname, search]);

  return null;
};

function App() {
  useEffect(() => {
    // Initialize Bootstrap tooltips and dropdowns if needed
    if (typeof window !== "undefined" && window.bootstrap) {
      // Bootstrap is available via CDN
    }
  }, []);

  // admin panel
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === "true"
  );

  // Ensure Router always gets a string basename (avoids null context when chunks fail to load)
  const basename = typeof APP_CONFIG.BASENAME === 'string' ? APP_CONFIG.BASENAME : '/';

  return (
    <ErrorBoundary>
      <Router basename={basename}>
        <MetaPixelPageTracker />
        <AnalyticsPageTracker />
        <VisitorHeartbeatTracker />
        <ScrollToTop />
        <CartProvider>
          <SearchPopupProvider>
            <Suspense fallback={<FullPageLoader />}>
              <Routes>
                {/* User Routes with Universal Layout */}
                <Route path="/" element={<UserLayout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="category/:slug" element={<CategoryPage />} />
                  <Route path="contact-us" element={<ContactUs />} />
                  <Route path="about-us" element={<AboutUs />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<TermsConditions />} />
                  <Route path="refund-policy" element={<RefundPolicy />} />
                  <Route path="disclaimer" element={<DisclaimerPage />} />
                  <Route path="product/:id" element={<ProductDetails />} />
                  <Route path="deal-of-the-week" element={<DealOfTheWeekPage />} />
                  <Route path="blogs" element={<BlogsPage />} />
                  <Route path="blog/:slug" element={<BlogDetailPage />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="order-success/:id" element={<OrderSuccess />} />
                  <Route path="payment/success" element={<PaymentSuccess />} />
                  <Route path="payment/failure" element={<PaymentFailure />} />
                  <Route path="my-orders" element={<MyOrders />} />
                  <Route path="order/:id/track" element={<TrackOrder />} />
                  <Route path="login" element={<Login />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="login-auth" element={<Auth />} />
                  <Route path="sign-up" element={<SignUp />} />
                </Route>

                {/* Admin Routes */}

                <Route
                  path="/admin/login"
                  element={<AdminLogin setIsAdmin={setIsAdmin} />}
                />

                {/* Super Admin routes: only role superadmin can access */}
                <Route path="/superadmin" element={<SuperAdminProtectedRoute />}>
                  <Route element={<SuperAdminLayout />}>
                    <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
                    <Route path="dashboard" element={<SuperAdminDashboard />} />
                    <Route path="create-superadmin" element={<CreateSuperAdmin />} />
                  </Route>
                </Route>

                {/* Admin Routes with Layout */}
                <Route
                  path="/admin"
                  element={
                    <AdminProtectedRoute>
                      <Layout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={<AdminDashboard />}
                  />
                  <Route path="analytics" element={<AnalyticsDashboard />} />
                  <Route
                    path="categories"
                    element={<CategoryDashboard />}
                  />
                  <Route
                    path="categories/add"
                    element={<AddCategory />}
                  />
                  <Route
                    path="categories/edit/:id"
                    element={<EditCategory />}
                  />
                  <Route
                    path="mobile-brand"
                    element={<MobileBrandDashboard />}
                  />
                  <Route
                    path="mobile-brand/add"
                    element={<AddMobileBrand />}
                  />
                  <Route
                    path="/admin/mobile-brand/details/:id"
                    element={<MobileBrandDetails />}
                  />
                  <Route
                    path="mobile-brand/edit/:id"
                    element={<EditMobileBrand />}
                  />
                  <Route
                    path="mobile-model"
                    element={<MobileModelDashboard />}
                  />
                  <Route
                    path="mobile-model/add"
                    element={<AddMobileModel />}
                  />
                  <Route
                    path="mobile-model/edit/:id"
                    element={<EditMobileModel />}
                  />
                  <Route
                    path="products"
                    element={<ProductsDashboard />}
                  />
                  <Route
                    path="products/add"
                    element={<AddProduct />}
                  />
                  <Route
                    path="/admin/products/view/:id"
                    element={<ProductView />}
                  />
                  <Route
                    path="products/edit/:id"
                    element={<EditProduct />}
                  />
                  <Route
                    path="mobile-case"
                    element={<MobileCase />}
                  />
                  <Route
                    path="mobile-case/add"
                    element={<AddMobileCase />}
                  />
                  <Route
                    path="mobile-case/edit/:id"
                    element={<EditMobileCase />}
                  />
                  <Route
                    path="orders"
                    element={<OrdersDashboard />}
                  />
                  <Route
                    path="orders/view/:id"
                    element={<OrderView />}
                  />
                  <Route
                    path="users"
                    element={<UsersDashboard />}
                  />
                  <Route
                    path="users/view/:id"
                    element={<UserView />}
                  />
                  <Route
                    path="admins"
                    element={<AdminsDashboard />}
                  />
                  <Route
                    path="admins/add"
                    element={<AddAdmin />}
                  />
                  <Route
                    path="admins/edit/:id"
                    element={<EditAdmin />}
                  />
                  <Route path="banners" element={<BannersDashboard />} />
                  <Route path="banners/add" element={<AddBanner />} />
                  <Route path="banners/edit/:id" element={<EditBanner />} />
                  <Route path="deal-of-the-week" element={<DealOfTheWeekDashboard />} />
                  <Route path="deal-of-the-week/add" element={<AddDealOfTheWeek />} />
                  <Route path="deal-of-the-week/edit/:id" element={<EditDealOfTheWeek />} />
                  <Route path="buy-one-get-one" element={<BuyOneGetOneDashboard />} />
                  <Route path="buy-one-get-one/add" element={<AddBuyOneGetOne />} />
                  <Route path="buy-one-get-one/edit/:id" element={<EditBuyOneGetOne />} />
                  <Route path="foxcom-originals" element={<FoxcomOriginalsDashboard />} />
                  <Route path="foxcom-originals/add" element={<AddFoxcomOriginals />} />
                  <Route path="foxcom-originals/edit/:id" element={<EditFoxcomOriginals />} />
                  <Route path="reviews" element={<ProductReviews />} />
                  <Route path="reviews/:productId" element={<ProductReviews />} />
                  <Route path="seller-reviews/add" element={<AddSellerReview />} />
                  <Route path="seller-reviews/edit/:id" element={<EditSellerReview />} />
                  <Route path="seller-reviews/product/:productId" element={<SellerReviewsByProduct />} />
                  <Route path="seller-reviews" element={<SellerReviewsDashboard />} />
                  <Route path="blogs" element={<BlogsDashboard />} />
                  <Route path="blogs/create" element={<AddBlog />} />
                  <Route path="blogs/edit/:id" element={<EditBlog />} />
                </Route>


              </Routes>
            </Suspense>
          </SearchPopupProvider>
        </CartProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
