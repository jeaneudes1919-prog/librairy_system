import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar'; // Import de la Navbar

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BiblioTech - Gestion de Bibliothèque',
  description: 'Plateforme professionnelle de gestion d\'ouvrages',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <AuthProvider>
          <Navbar /> {/* La barre de navigation s'affiche sur toutes les pages */}
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}