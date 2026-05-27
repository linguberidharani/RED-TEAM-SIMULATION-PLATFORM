import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page refresh
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('rt_token');
      if (!token) { setLoading(false); return; }
      try {
        const res = await getMe();
        setUser(res.data.user);
      } catch {
        localStorage.removeItem('rt_token');
        localStorage.removeItem('rt_user');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // Called after OTP verified — backend returns token + user
  const loginWithToken = (token, userData) => {
    localStorage.setItem('rt_token', token);
    localStorage.setItem('rt_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('rt_token');
    localStorage.removeItem('rt_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);