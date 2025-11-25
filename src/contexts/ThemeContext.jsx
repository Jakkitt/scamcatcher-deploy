import React, { createContext, useContext, useEffect, useState } from 'react';

// ให้ default มีโครงให้ครบกัน error เวลา useTheme ก่อน Provider
const ThemeCtx = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }) {
  // อ่านค่าจาก localStorage ถ้าไม่มีให้เริ่มที่ 'dark'
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = window.localStorage.getItem('theme');
    return saved || 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const root = document.documentElement;

    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mql.matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    apply();

    // เก็บค่าลง localStorage + cookie
    try {
      window.localStorage.setItem('theme', theme);
    } catch {}

    try {
      document.cookie =
        'theme=' +
        theme +
        '; path=/; max-age=' +
        60 * 60 * 24 * 365 +
        '; SameSite=Lax';
    } catch {}

    if (theme === 'system') {
      mql.addEventListener?.('change', apply);
      return () => mql.removeEventListener?.('change', apply);
    }
  }, [theme]);

  // ใช้ชื่อนี้ให้ตรงกับ Navbar: toggleTheme
  const toggleTheme = () =>
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}
