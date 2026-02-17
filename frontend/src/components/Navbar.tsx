'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, LogOut, User, LayoutDashboard, LogIn } from 'lucide-react'; // Icônes pro

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et Nom */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">
                Biblio<span className="text-blue-600">Tech</span>
              </span>
            </Link>
          </div>

          {/* Liens de droite */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-medium text-slate-700">{user.username}</span>
                  <span className="text-xs text-slate-500 uppercase">{isAdmin ? 'Administrateur' : 'Membre'}</span>
                </div>

                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition-all shadow-sm hover:shadow-md"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}