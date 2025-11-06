
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { CartProvider } from '@/hooks/useCart';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';

import MainLayout from '@/components/MainLayout';
import AdminLayout from '@/components/AdminLayout';
import ScrollToTop from '@/components/ScrollToTop';

// Lazy-loaded pages
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const MarketplacePage = React.lazy(() => import('@/pages/MarketplacePage'));
const ProductDetailPage = React.lazy(() => import('@/pages/ProductDetailPage'));
const FarmerOnboardingPage = React.lazy(() => import('@/pages/FarmerOnboardingPage'));
const LogisticsPage = React.lazy(() => import('@/pages/LogisticsPage'));
const ContactPage = React.lazy(() => import('@/pages/ContactPage'));
const BlogPage = React.lazy(() => import('@/pages/BlogPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage'));
const FarmerDashboard = React.lazy(() => import('@/pages/FarmerDashboard'));
const CustomerDashboard = React.lazy(() => import('@/pages/CustomerDashboard'));
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard'));
const AdminUserDetailsPage = React.lazy(() => import('@/pages/AdminUserDetailsPage'));
const CheckoutPage = React.lazy(() => import('@/pages/CheckoutPage'));
const SuccessPage = React.lazy(() => import('@/pages/SuccessPage'));

const PageLoader = () => (
    <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
    </div>
);


function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/admin-dashboard/*" element={
                    <AdminLayout>
                        <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users/:id" element={<AdminUserDetailsPage />} />
                        </Routes>
                    </AdminLayout>
                    } />
                    <Route path="/*" element={
                    <MainLayout>
                        <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/marketplace" element={<MarketplacePage />} />
                        <Route path="/marketplace/:id" element={<ProductDetailPage />} />
                        <Route path="/farmer-onboarding" element={<FarmerOnboardingPage />} />
                        <Route path="/logistics" element={<LogisticsPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/success" element={<SuccessPage />} />
                        </Routes>
                    </MainLayout>
                    } />
                </Routes>
            </Suspense>
          <Toaster />
          <Link to="/blog">
            <motion.div
              className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg flex items-center justify-center cursor-pointer z-50"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <BookOpen className="w-6 h-6" />
            </motion.div>
          </Link>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
