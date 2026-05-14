import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('facultyup_token'));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('facultyup_token');
      const storedUser = localStorage.getItem('facultyup_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Optionally verify token with server
          const res = await authAPI.me();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('facultyup_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // Token invalid - clear storage
          localStorage.removeItem('facultyup_token');
          localStorage.removeItem('facultyup_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('facultyup_token', newToken);
      localStorage.setItem('facultyup_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return { success: true, user: newUser };
    }
    return { success: false };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('facultyup_token');
      localStorage.removeItem('facultyup_user');
      setUser(null);
      setToken(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('facultyup_user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
