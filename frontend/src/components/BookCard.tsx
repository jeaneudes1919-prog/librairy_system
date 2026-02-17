'use client';

import { useState } from 'react';
import { Book as BookIcon, CheckCircle, XCircle, Clock, BookOpenCheck } from 'lucide-react';
import { Book } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface BookCardProps {
  book: Book;
  onBorrow: (book: Book) => Promise<boolean>;
  isRequested: boolean;
}

export default function BookCard({ book, onBorrow, isRequested }: BookCardProps) {
  const { user } = useAuth();
  const [isBorrowing, setIsBorrowing] = useState(false);

  // État local pour gérer l'affichage après un clic réussi sans recharger toute la page
  const alreadySent = isRequested; 

  if (!book) return null;

  const handleClick = async () => {
    setIsBorrowing(true);
    await onBorrow(book); // La fonction parente gère la logique et les alertes
    setIsBorrowing(false);
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      
      {/* En-tête de la carte : Titre et Auteur */}
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600 mb-4">
            <BookIcon className="h-6 w-6" />
          </div>
          {/* Badge de disponibilité */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            book.disponible 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {book.disponible ? 'En rayon' : 'Indisponible'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {book.titre}
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          {book.auteur}
        </p>
        {book.isbn && <p className="text-xs text-slate-400 mt-2">ISBN: {book.isbn}</p>}
      </div>

      {/* Pied de carte : Actions */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        {user ? (
            book.disponible ? (
                !alreadySent ? (
                    <button
                        onClick={handleClick}
                        disabled={isBorrowing}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all ${
                            isBorrowing 
                            ? 'bg-slate-400 cursor-wait' 
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                        }`}
                    >
                        {isBorrowing ? (
                            <>Patientez...</>
                        ) : (
                            <><BookOpenCheck className="h-4 w-4" /> Emprunter</>
                        )}
                    </button>
                ) : (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        Demande en cours
                    </div>
                )
            ) : (
                <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-sm font-medium cursor-not-allowed">
                    <XCircle className="h-4 w-4" />
                    Non disponible
                </div>
            )
        ) : (
            <span className="text-xs text-center w-full text-slate-400 italic">
                Connectez-vous pour emprunter
            </span>
        )}
      </div>
    </div>
  );
}