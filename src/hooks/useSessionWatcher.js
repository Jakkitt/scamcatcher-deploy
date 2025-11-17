import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { onSessionExpired } from '../utils/api';

export function useSessionWatcher() {
  const hasShown = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    const reset = () => {
      hasShown.current = false;
    };
    window.addEventListener('focus', reset);
    const off = onSessionExpired(async () => {
      if (hasShown.current) return;
      hasShown.current = true;
      toast.error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      await logout();
      navigate('/login', { replace: true, state: { from: location } });
    });
    return () => {
      window.removeEventListener('focus', reset);
      off?.();
    };
  }, [logout, navigate, location]);
}
