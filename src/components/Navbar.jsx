// src/components/Navbar.jsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../i18n/strings';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // ใช้ context ธีม
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-md dark:bg-slate-950/85 dark:border-slate-800">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white"
        >
          {t('layout.brand')}
        </Link>

        {/* Nav + Theme toggle */}
        <nav className="flex items-center gap-3 text-sm">
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `px-2 py-1 rounded-md font-medium transition-colors ${
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`
            }
          >
            {t('layout.nav.search')}
          </NavLink>

          <NavLink
            to="/report"
            className={({ isActive }) =>
              `px-2 py-1 rounded-md font-medium transition-colors ${
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`
            }
          >
            {t('layout.nav.report')}
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-2 py-1 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`
              }
            >
              {t('layout.nav.admin')}
            </NavLink>
          )}

          {!user ? (
            <>
              <NavLink
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
              >
                {t('layout.nav.login')}
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `px-2 py-1 rounded-md font-medium transition-colors ${
                    isActive
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`
                }
              >
                {t('layout.nav.profile')}
              </NavLink>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t('layout.nav.logout')}
              </button>
            </>
          )}

          {/* ปุ่มสลับธีม มุมขวาบน (ตำแหน่งกรอบแดงในรูป) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-105 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
