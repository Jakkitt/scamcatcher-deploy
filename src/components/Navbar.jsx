import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar(){
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-gray-200 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-gray-950/80 dark:border-gray-800 shadow-md">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-xl">ScamCatcher</Link>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink
            to="/search/detail"
            className={({isActive})=>`px-2 py-1 rounded-md font-medium ${isActive ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
          >
            ค้นหา
          </NavLink>
          <NavLink
            to="/report"
            className={({isActive})=>`px-2 py-1 rounded-md font-medium ${isActive ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
          >
            รายงาน
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({isActive})=>`px-2 py-1 rounded-md font-medium ${isActive ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
            >
              แอดมิน
            </NavLink>
          )}
          {!user ? (
            <>
              <NavLink to="/login" className="px-3 py-1.5 rounded-lg border dark:border-gray-700">เข้าสู่ระบบ</NavLink>
              <NavLink to="/register" className="px-3 py-1.5 rounded-lg bg-black text-white">สมัครสมาชิก</NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/profile"
                className={({isActive})=>`px-2 py-1 rounded-md font-medium ${isActive ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
              >
                โปรไฟล์
              </NavLink>
              <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border dark:border-gray-700">ออกจากระบบ</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
