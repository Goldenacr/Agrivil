import React, { createContext, useContext, useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem('agrivil_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    /*
     // --- SUPABASE AUTH LISTENER (keep this commented until integration) ---
     if (supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user;
            if (currentUser) {
                // You might want to fetch profile details here
                const userProfile = { 
                    id: currentUser.id, 
                    email: currentUser.email, 
                    name: currentUser.user_metadata?.name || 'User',
                    role: currentUser.user_metadata?.role || 'customer' 
                };
                setUser(userProfile);
                localStorage.setItem('agrivil_user', JSON.stringify(userProfile));
            } else {
                setUser(null);
                localStorage.removeItem('agrivil_user');
            }
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
     }
    */
  }, []);

  // --- Local Storage Auth (Current) ---
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('agrivil_users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      setUser(userWithoutPassword);
      localStorage.setItem('agrivil_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('agrivil_users') || '[]');
    
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('agrivil_users', JSON.stringify(users));

    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    setUser(userWithoutPassword);
    localStorage.setItem('agrivil_user', JSON.stringify(userWithoutPassword));

    return { success: true };
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('agrivil_user');
    // if (supabase) supabase.auth.signOut(); // <-- Add this for Supabase logout
  };

  /*
  // --- SUPABASE AUTH FUNCTIONS (keep commented until integration) ---
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const register = async (userData) => {
    const { email, password, name, role } = userData;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };
  */

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};