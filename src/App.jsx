import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './components/Toast';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';
import AdminLayout from './components/AdminLayout';

// Pages
import Home from './pages/Home';
import CustomCakes from './pages/CustomCakes';
import Catalog from './pages/Catalog';
import Combos from './pages/Combos';
import ComboDetail from './pages/ComboDetail';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Reviews from './pages/Reviews';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminCustomRequests from './pages/admin/CustomRequests';
import AdminReviews from './pages/admin/Reviews';
import AdminHeroSection from './pages/admin/HeroSection';
import AdminNewsletter from './pages/admin/Newsletter';
import AdminOffers from './pages/admin/Offers';
import AdminSettings from './pages/admin/Settings';
import AdminCombos from './pages/admin/Combos';
import CustomCakeDetail from './pages/CustomCakeDetail';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router basename="/msucre-frontend">
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/custom-cakes" element={<Layout><CustomCakes /></Layout>} />
            <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
            <Route path="/combos" element={<Layout><Combos /></Layout>} />
            <Route path="/combos/:id" element={<Layout><ComboDetail /></Layout>} />
            <Route path="/products/:slug" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/cart" element={<Layout><Cart /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />
            <Route path="/reviews" element={<Layout><Reviews /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/orders/:id" element={<Layout><OrderDetail /></Layout>} />

            {/* Protected Routes */}
            <Route
              path="/checkout"
              element={
                <Layout>
                  <Checkout />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <Layout><MyOrders /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - With AdminLayout (Sidebar) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminProducts /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminOrders /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/custom-requests"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminCustomRequests /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/custom-cakes/:id"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><CustomCakeDetail /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminReviews /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hero"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminHeroSection /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/newsletter"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminNewsletter /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/combos"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminCombos /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/offers"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminOffers /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout><AdminSettings /></AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <Layout>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                      <a href="/" className="btn-primary">
                        Go Home
                      </a>
                    </div>
                  </div>
                </Layout>
              }
            />
            </Routes>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;

