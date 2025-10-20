import React, { createContext, useContext, useState, useEffect } from 'react';
import { fakeUsers, User } from '@/lib/fakeData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('rentchain_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const foundUser = fakeUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('rentchain_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, password: string): boolean => {
    const existingUser = fakeUsers.find(u => u.email === email);
    if (existingUser) {
      return false;
    }
    
    const newUser: User = {
      id: String(fakeUsers.length + 1),
      name,
      email,
      password,
    };
    
    fakeUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('rentchain_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rentchain_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
