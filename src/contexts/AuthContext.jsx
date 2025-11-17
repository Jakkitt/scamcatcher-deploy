// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, register, updateUser } from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

// Load user from localStorage when refreshing the page
  useEffect(() => {
    const saved = getCurrentUser();
    if (saved) setUser(saved);
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

  const handleUpdate = (partial) => {
    // Support both API (async) mode and mock (sync) mode
    Promise.resolve(updateUser(partial)).then((updated)=>{
      setUser(updated);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateUser: handleUpdate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
