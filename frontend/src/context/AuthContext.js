import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();
const KEY = 'gymUser';

const readStored = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Keep the session across page refreshes.
  const [user, setUser] = useState(readStored);

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem(KEY, JSON.stringify(userData));
    } catch (e) {
      /* storage unavailable: session lasts until refresh */
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* ignore */
    }
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
