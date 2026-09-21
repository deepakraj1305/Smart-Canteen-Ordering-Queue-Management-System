import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import { AdminLoginPage, LoginPage, SignupPage } from './pages/AuthPages';
import StudentHomePage from './pages/StudentHomePage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ServingPage from './pages/ServingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminCounterPage from './pages/AdminCounterPage';

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50 px-4 text-center">
      <p className="text-7xl">🍽️</p>
      <h1 className="font-display mt-4 text-3xl font-extrabold text-stone-950">404 — Plate not found</h1>
      <p className="mt-2 text-sm text-stone-500">This page wandered off to the wrong counter.</p>
      <a href="/" className="mt-5 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white">
        Back home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Student */}
            <Route
              path="/menu"
              element={
                <ProtectedRoute allow={['student', 'admin']}>
                  <StudentHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allow={['student', 'admin']}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allow={['student', 'admin']}>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track/:id"
              element={
                <ProtectedRoute allow={['student', 'admin']}>
                  <TrackOrderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/serving"
              element={
                <ProtectedRoute allow={['student', 'admin']}>
                  <ServingPage />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allow={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allow={['admin']}>
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <ProtectedRoute allow={['admin']}>
                  <AdminMenuPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/counter"
              element={
                <ProtectedRoute allow={['admin']}>
                  <AdminCounterPage />
                </ProtectedRoute>
              }
            />

            <Route path="/home" element={<Navigate to="/menu" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
