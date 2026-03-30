import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      authAPI
        .me()
        .then((userData) => setUser(userData))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    await authAPI.login(email, password);
    const userData = await authAPI.me();
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const userData = await authAPI.register(data);
    // Auto-login after register
    await login(data.email, data.password);
    return userData;
  };

  const logout = () => {
    setUser(null);
    authAPI.logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
