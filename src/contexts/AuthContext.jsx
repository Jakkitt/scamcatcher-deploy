// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, register, updateUser, getCsrfToken } from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

// Load user from localStorage when refreshing the page
  useEffect(() => {
    const saved = getCurrentUser();
    if (saved) setUser(saved);
    // Initialize CSRF token
    getCsrfToken().catch(() => console.warn('Failed to fetch CSRF token'));
  }, []);

  const handleLogin = async (data) => {
    const u = await login(data);
    setUser(u);
    return u;
  };

  const handleRegister = async (data) => {
    const u = await register(data);
    setUser(u);
    return u;
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleUpdate = async (partial) => {
    // Support both API (async) mode and mock (sync) mode
    const updated = await Promise.resolve(updateUser(partial));
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateUser: handleUpdate,
        updateProfile: handleUpdate, // Alias for updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
