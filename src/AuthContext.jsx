import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : { isAuthenticated: false, role: null, user: null };
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  const login = async (token, user, role) => {
    // Store token in localStorage
    localStorage.setItem('token', token);
    setAuth({ isAuthenticated: true, role, user });
  };

  const register = (user, role) => {
    setAuth({ isAuthenticated: true, role, user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ isAuthenticated: false, role: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ 
      ...auth, 
      isAuthenticated: auth.isAuthenticated, 
      user: auth.user, 
      role: auth.role,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 