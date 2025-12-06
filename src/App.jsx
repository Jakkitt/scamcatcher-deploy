// src/App.jsx
import { Routes, Route } from 'react-router-dom';

import Home1 from './pages/Home1';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Report from './pages/Report';
import SearchDetail from './pages/SearchDetail';
import SearchResults from './pages/SearchResults';
import ReportDetail from './pages/ReportDetail';
import ReportList from './pages/ReportList';
import PublicReports from './pages/PublicReports';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import ChangePassword from './pages/ChangePassword';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import RequireAuth from './utils/RequireAuth';
import RequireRole from './utils/RequireRole';
import ErrorBoundary from './ErrorBoundary';
import AppToaster from './components/Toaster';
import AdminRoutes from './admin/routes';

import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { t } from './i18n/strings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <Navbar />

          <ErrorBoundary>
            <div className="flex-1 pt-16">
              <Routes>
                {/* public */}
                <Route path="/" element={<Home1 />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element={<About />} />

                {/* search & report detail: เข้าดูได้เลย ไม่ต้องล็อกอิน */}
                <Route path="/search" element={<SearchDetail />} />
                <Route path="/search/detail" element={<SearchDetail />} />
                <Route path="/search/results" element={<SearchResults />} />
                <Route path="/reports/:id" element={<ReportDetail />} />
                <Route path="/public-reports" element={<PublicReports />} />

                {/* private (ยังต้องล็อกอินเหมือนเดิม) */}
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/report"
                  element={
                    <RequireAuth>
                      <Report />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <RequireAuth>
                      <ReportList />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/change-password"
                  element={
                    <RequireAuth>
                      <ChangePassword />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireAuth>
                      <Settings />
                    </RequireAuth>
                  }
                />

                {/* admin */}
                <Route
                  path="/admin/*"
                  element={
                    <RequireAuth>
                      <RequireRole role="admin">
                        <AdminRoutes />
                      </RequireRole>
                    </RequireAuth>
                  }
                />

                {/* fallback */}
                <Route
                  path="*"
                  element={
                    <div className="container py-20 text-center">
                      {t('error.notFound')}
                    </div>
                  }
                />
              </Routes>
            </div>
          </ErrorBoundary>

          <Footer />
          <AppToaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
