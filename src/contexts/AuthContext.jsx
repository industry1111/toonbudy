import { createContext, useContext, useState, useEffect } from 'react';
import { userRepo } from '../repo';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = userRepo.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = userRepo.login(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const signup = async (email, password, nickname) => {
    const result = userRepo.signup({ email, password, nickname });
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    userRepo.logout();
    setUser(null);
  };

  const updateUser = (updates) => {
    const result = userRepo.updateUser(updates);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const completeOnboarding = () => {
    const result = userRepo.completeOnboarding();
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
