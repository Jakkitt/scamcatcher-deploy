// src/App.jsx
import { Routes, Route } from 'react-router-dom';

import Home1 from './pages/Home1';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Report from './pages/Report';
import SearchDetail from './pages/SearchDetail';
import SearchResults from './pages/SearchResults';
import ReportList from './pages/ReportList';
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
// Keep AuthProvider in place if it already exists
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
                <Route path="/about" element={<About />} />

                {/* private */}
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
                <Route path="/search/detail" element={<RequireAuth><SearchDetail /></RequireAuth>} />
                <Route path="/search/results" element={<RequireAuth><SearchResults /></RequireAuth>} />
                <Route path="/reports" element={<RequireAuth><ReportList /></RequireAuth>} />
                <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />

                {/* admin */}
                <Route path="/admin/*" element={
                  <RequireAuth>
                    <RequireRole role="admin">
                      <AdminRoutes />
                    </RequireRole>
                  </RequireAuth>
                } />

                {/* fallback */}
                <Route path="*" element={<div className="container py-20 text-center">{t('error.notFound')}</div>} />
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
