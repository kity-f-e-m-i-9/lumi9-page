import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useToast } from './ToastContext';
import { trackLogin } from '../lib/dataLayer';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [modalMode, setModalMode] = useState(null); // 'login' | 'register' | null
  const toast = useToast();

  useEffect(() => {
    apiFetch('/api/me')
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginStatus = params.get('login');
    const loginError = params.get('login_error');

    if (!loginStatus && !loginError) return;

    if (loginStatus === 'success') {
      apiFetch('/api/me').then((data) => {
        setUser(data?.user || null);
        toast.success(`Welcome, ${data?.user?.name || 'back'}!`);
        if (data?.user) {
          trackLogin(data.user, 'google');
        }
      });
    } else if (loginError === 'google_unavailable' || loginError === 'google_failed') {
      toast.error('Google sign-in failed. Please try again.');
    }

    params.delete('login');
    params.delete('login_error');
    const query = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLogin = useCallback(() => setModalMode('login'), []);
  const openRegister = useCallback(() => setModalMode('register'), []);
  const closeModal = useCallback(() => setModalMode(null), []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      checkingSession,
      setUser,
      modalMode,
      openLogin,
      openRegister,
      closeModal,
      logout,
    }),
    [user, checkingSession, modalMode, openLogin, openRegister, closeModal, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
