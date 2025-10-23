import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserRole {
  id: string;
  user_id: string;
  role: 'ADMIN' | 'EMPLOYEE';
  username: string;
  full_name: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        if (!error && data) {
          setUserRole(data);
          setIsAdmin(data.role === 'ADMIN');
        } else {
          setUserRole(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
        setIsAdmin(false);
      }
    };

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          if (session?.user) {
            setUser(session.user);
            await fetchUserRole(session.user.id);
          } else {
            setUser(null);
            setUserRole(null);
            setIsAdmin(false);
          }
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, password_hash')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (roleError || !userRoleData) {
        return { error: { message: 'Usuário ou senha inválidos' } };
      }

      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userRoleData.user_id);

      if (userError || !userData?.user?.email) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${username}@internal.local`,
          password,
        });

        if (error) {
          return { error: { message: 'Usuário ou senha inválidos' } };
        }

        return { error: null };
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password,
      });

      if (signInError) {
        return { error: { message: 'Usuário ou senha inválidos' } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'Erro ao fazer login' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    userRole,
    isAdmin,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};