'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios'; // Notre instance axios configurée
import { UserPlus, Mail, Lock, User } from 'lucide-react'; // Icônes pour le design pro

export default function Register() {
  // État pour stocker les données du formulaire
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    nom: '', 
    prenom: '' 
  });
  
  const router = useRouter();
  
  // État pour gérer le chargement (désactiver le bouton pendant l'envoi)
  const [loading, setLoading] = useState(false);

  // Fonction appelée lors de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setLoading(true);   // Active l'indicateur de chargement

    try {
      // -----------------------------------------------------------------------
      // CORRECTION MAJEURE ICI (Fix de l'erreur 415)
      // -----------------------------------------------------------------------
      // Pourquoi 'application/ld+json' ?
      // Par défaut, API Platform (Symfony) est configuré pour parler le format "JSON-LD" (Linked Data).
      // Si on envoie du JSON classique (application/json), le serveur rejette la requête 
      // avec une erreur 415 "Unsupported Media Type".
      // On force donc l'en-tête ici pour dire au serveur : "T'inquiète, c'est bien le format que tu attends".
      // -----------------------------------------------------------------------
      await axios.post('/utilisateurs', formData, {
        headers: {
          'Content-Type': 'application/ld+json'
        }
      });

      // Si on arrive ici, c'est que le serveur a répondu 201 Created
      alert('✅ Compte créé avec succès ! Connectez-vous.');
      router.push('/login'); // Redirection vers la page de connexion

    } catch (error: any) {
      console.error("Erreur inscription", error);
      
      // Gestion d'erreur "intelligente" :
      // On essaie de récupérer le message précis renvoyé par Symfony (ex: "Email déjà utilisé")
      // Sinon, on affiche un message générique.
      const serverMessage = error.response?.data['hydra:description'] || "Vérifiez vos informations.";
      alert("❌ Erreur : " + serverMessage);
      
    } finally {
        // Quoi qu'il arrive (succès ou erreur), on réactive le bouton
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        
        {/* En-tête du formulaire */}
        <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Créer un compte</h2>
          <p className="mt-2 text-sm text-slate-600">
            Rejoignez la bibliothèque pour emprunter des livres.
          </p>
        </div>
        
        {/* Formulaire */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Prénom et Nom côte à côte */}
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <User className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Prénom" 
                        required 
                        className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition-all"
                        onChange={e => setFormData({...formData, prenom: e.target.value})} 
                    />
                </div>
                <div className="relative">
                    <User className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Nom" 
                        required 
                        className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition-all"
                        onChange={e => setFormData({...formData, nom: e.target.value})} 
                    />
                </div>
            </div>
            
            {/* Email */}
            <div className="relative">
                <Mail className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                <input 
                    type="email" 
                    placeholder="Adresse Email" 
                    required 
                    className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition-all"
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                />
            </div>

            {/* Mot de passe */}
            <div className="relative">
                <Lock className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                <input 
                    type="password" 
                    placeholder="Mot de passe" 
                    required 
                    className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition-all"
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                />
            </div>
          </div>

          {/* Bouton d'action */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
                // Petit spinner ou texte pendant le chargement
                <span className="flex items-center gap-2">Patientez...</span>
            ) : (
                "S'inscrire"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}