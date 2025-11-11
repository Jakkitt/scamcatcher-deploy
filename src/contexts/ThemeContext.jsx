import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeCtx = createContext({ theme: 'light', setTheme: () => {}, toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }) {
  // ค่าเริ่มต้น: ใช้ธีมใหม่ (dark) เป็นค่า default หากยังไม่เคยตั้งค่า
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const root = document.documentElement;
      const isDark = theme === 'dark' || (theme === 'system' && mql.matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    apply();
    localStorage.setItem('theme', theme);
    try { document.cookie = 'theme=' + theme + '; path=/; max-age=' + (60*60*24*365) + '; SameSite=Lax'; } catch {}

    if (theme === 'system') {
      mql.addEventListener?.('change', apply);
      return () => mql.removeEventListener?.('change', apply);
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
