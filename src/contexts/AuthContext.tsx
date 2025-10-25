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
      .maybeSingle(); // sem filtrar is_active aqui

    if (!error && data) {
      setUserRole(data);
      setIsAdmin(data.role === 'ADMIN' && data.is_active); // garante que isAdmin só seja true se is_active também for true
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
      // Verificar credenciais usando a função do banco de dados
      const { data: authResult, error: authError } = await supabase.rpc('authenticate_user', {
        p_username: username,
        p_password: password
      });

      if (authError || !authResult) {
        return { error: { message: 'Usuário ou senha inválidos' } };
      }

      // Se user_id está disponível, fazer login no Supabase Auth
      if (authResult.user_id) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(authResult.user_id);

        if (!userError && userData?.user?.email) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userData.user.email,
            password,
          });

          if (!signInError) {
            return { error: null };
          }
        }
      }

      // Criar sessão temporária para usuários sem Supabase Auth user_id
      const tempEmail = `${username}@internal.local`;

      // Tentar criar o usuário se não existir
      const { error: signUpError } = await supabase.auth.signUp({
        email: tempEmail,
        password,
        options: {
          data: {
            username: username,
            full_name: authResult.full_name
          }
        }
      });

      if (!signUpError) {
        // Atualizar user_id na tabela user_roles
        await supabase
          .from('user_roles')
          .update({ user_id: (await supabase.auth.getUser()).data.user?.id })
          .eq('username', username);
      }

      // Fazer login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password,
      });

      if (signInError) {
        return { error: { message: 'Usuário ou senha inválidos' } };
      }

      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
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