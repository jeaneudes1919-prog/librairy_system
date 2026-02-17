'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from '@/lib/axios';
import BookCard from '@/components/BookCard';
import { Book } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Search, Library, Filter, X } from 'lucide-react';

export default function Home() {
  // --- ÉTATS (STATES) ---
  const [books, setBooks] = useState<Book[]>([]);
  const [myRequestBookIds, setMyRequestBookIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les filtres de recherche spécifiques
  const [filters, setFilters] = useState({
    titre: '',
    auteur: ''
  });

  const { user } = useAuth();

  // --- LOGIQUE DE RECUPERATION DES DONNEES ---

  // Fonction pour construire l'URL avec les paramètres de recherche
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      // Construction dynamique de la requête de filtrage
      const params = new URLSearchParams();
      if (filters.titre) params.append('titre', filters.titre);
      if (filters.auteur) params.append('auteur', filters.auteur);

      const url = `/livres?${params.toString()}`;
      const response = await axios.get(url);

      // Gestion de la réponse API Platform (qui peut varier selon la configuration)
      if (Array.isArray(response.data)) {
        setBooks(response.data);
      } else if (response.data['hydra:member']) {
        setBooks(response.data['hydra:member']);
      } else if (response.data['member']) {
        setBooks(response.data['member']);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du catalogue", error);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Se recharge uniquement si les filtres changent

  // Récupération des demandes spécifiques à l'utilisateur connecté
  const fetchMyRequests = useCallback(async () => {
    if (!user || !user.id) return;
    try {
        // Filtre côté serveur sur l'email du demandeur
        const response = await axios.get(`/demande_emprunts?demandeur.email=${user.username}`);
        
        const allRequests = Array.isArray(response.data) 
            ? response.data 
            : (response.data['hydra:member'] || response.data['member'] || []);

        // Filtrage de sécurité côté client pour garantir l'isolation des données
        const myRequests = allRequests.filter((req: any) => {
            const demandeurId = req.demandeur?.id || (typeof req.demandeur === 'string' ? parseInt(req.demandeur.split('/').pop() || '0') : 0);
            return demandeurId === user.id;
        });

        // Extraction des IDs des livres concernés
        const ids = myRequests
            .filter((req: any) => req.statut === 'en_attente' || req.statut === 'accepte')
            .map((req: any) => {
                if (req.livre && req.livre.id) return req.livre.id;
                if (typeof req.livre === 'string') return parseInt(req.livre.split('/').pop() || '0');
                return 0;
            });
        setMyRequestBookIds(ids);
    } catch (error) {
        console.error("Erreur historique demandes", error);
    }
  }, [user]);

  // --- EFFETS DE BORD ---
  
  // Déclenchement de la recherche avec un délai (Debounce) pour éviter de surcharger l'API
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchBooks();
    }, 400); 

    if (user) fetchMyRequests();

    return () => clearTimeout(timer);
  }, [fetchBooks, fetchMyRequests, user]);

  // --- GESTIONNAIRES D'EVENEMENTS ---

  const handleBorrow = async (book: Book): Promise<boolean> => {
    if (!user || !user.id) { 
        alert("Veuillez vous connecter pour accéder aux services d'emprunt."); 
        return false; 
    }
    
    // Confirmation native pour l'instant (peut être remplacée par une modale)
    if (!confirm(`Confirmer la demande d'emprunt pour : "${book.titre}" ?`)) return false;

    try {
        const userIRI = `/api/utilisateurs/${user.id}`;
        const livreIRI = book['@id'] || `/api/livres/${book.id}`;

        await axios.post('/demande_emprunts', {
            livre: livreIRI,
            demandeur: userIRI,
            statut: 'en_attente'
        }, { headers: { 'Content-Type': 'application/ld+json' } });

        alert('Demande enregistrée avec succès. En attente de validation.');
        fetchMyRequests(); 
        return true;
    } catch (error: any) {
        if (error.response) {
            const msg = error.response.data['hydra:description'] || "Erreur lors du traitement de la demande.";
            alert("Impossible de traiter la demande : " + msg);
        }
        return false;
    }
  };

  const clearFilters = () => {
    setFilters({ titre: '', auteur: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- HERO SECTION & LANDING --- */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-xl mb-6 shadow-sm">
                <Library className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Bibliothèque Universitaire
            </h1>
            <p className="max-w-2xl text-lg text-slate-600 mb-10">
                Accédez à notre catalogue complet, effectuez vos recherches par critères précis et gérez vos emprunts en temps réel.
            </p>
            
            {/* --- BARRE DE RECHERCHE AVANCÉE (REQ: Filtres Titre/Auteur) --- */}
            <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex flex-col md:flex-row gap-4">
                    
                    {/* Filtre Titre */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Rechercher par titre..." 
                            value={filters.titre}
                            onChange={(e) => setFilters({ ...filters, titre: e.target.value })}
                        />
                    </div>

                    {/* Filtre Auteur */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Rechercher par auteur..." 
                            value={filters.auteur}
                            onChange={(e) => setFilters({ ...filters, auteur: e.target.value })}
                        />
                    </div>

                    {/* Bouton Reset */}
                    {(filters.titre || filters.auteur) && (
                        <button 
                            onClick={clearFilters}
                            className="flex items-center justify-center px-4 py-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors"
                            title="Effacer les filtres"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- RÉSULTATS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Résultats du catalogue</h2>
            <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                {books.length} ouvrage(s) trouvé(s)
            </span>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-500 font-medium">Chargement des données...</p>
            </div>
        ) : (
            <>
                {books.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book) => (
                            <BookCard 
                                key={book.id} 
                                book={book} 
                                onBorrow={handleBorrow}
                                isRequested={myRequestBookIds.includes(book.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Search className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">Aucun résultat</h3>
                        <p className="text-slate-500">Essayez de modifier vos critères de recherche.</p>
                        <button 
                            onClick={clearFilters}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Voir tous les livres
                        </button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}