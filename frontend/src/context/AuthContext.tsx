'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode"; 

// On définit à quoi ressemble notre User
interface User {
  id: number; // <--- AJOUT DE L'ID
  username: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Au chargement, on vérifie si un token existe déjà
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        // On vérifie si le token n'est pas expiré
        if (decoded.exp * 1000 < Date.now()) {
            logout();
        } else {
            setToken(storedToken);
            // On récupère l'ID du token
            setUser({ 
                id: decoded.id, 
                username: decoded.username, 
                roles: decoded.roles 
            });
        }
      } catch (error) {
        logout();
      }
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decoded: any = jwtDecode(newToken);
    // On récupère l'ID du token lors du login
    setUser({ 
        id: decoded.id,
        username: decoded.username, 
        roles: decoded.roles 
    });
    router.push('/'); // Redirection vers l'accueil
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const isAdmin = user?.roles.includes('ROLE_ADMIN') || false;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
};