import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ddu_paperhub_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ddu_paperhub_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If token exists, verify current user profile
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('ddu_paperhub_user', JSON.stringify(res.data.data));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const authData = res.data.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('ddu_paperhub_token', authData.token);
      localStorage.setItem('ddu_paperhub_user', JSON.stringify(authData));
      return authData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.success) {
      const authData = res.data.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('ddu_paperhub_token', authData.token);
      localStorage.setItem('ddu_paperhub_user', JSON.stringify(authData));
      return authData;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ddu_paperhub_token');
    localStorage.removeItem('ddu_paperhub_user');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isContributor = user?.role === 'ROLE_CONTRIBUTOR' || isAdmin;
  const isStudent = user?.role === 'ROLE_STUDENT';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAdmin,
      isContributor,
      isStudent,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
