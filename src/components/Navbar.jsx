import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { t } from '../i18n/strings'

export default function Navbar(){
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-gray-200 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-gray-950/80 dark:border-gray-800 shadow-md">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-xl">{t('layout.brand')}</Link>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink
            to="/search/detail"
            className={({isActive})=>`px-2 py-1 rounded-md font-medium ${isActive ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
          >
            {t('layout.nav.search')}
          </NavLink>
          <NavLink
            to="/report"
            className={({isActive})=>`px-2 py-1 rounded-md font-medium ${isActive ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
          >
            {t('layout.nav.report')}
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({isActive})=>`px-2 py-1 rounded-md font-medium ${isActive ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
            >
              {t('layout.nav.admin')}
            </NavLink>
          )}
          {!user ? (
            <>
              <NavLink to="/login" className="px-3 py-1.5 rounded-lg border dark:border-gray-700">{t('layout.nav.login')}</NavLink>
              <NavLink to="/register" className="px-3 py-1.5 rounded-lg bg-black text-white">{t('layout.nav.register')}</NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/profile"
                className={({isActive})=>`px-2 py-1 rounded-md font-medium ${isActive ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {t('layout.nav.profile')}
              </NavLink>
              <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border dark:border-gray-700">{t('layout.nav.logout')}</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
