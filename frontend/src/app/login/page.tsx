'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios'; // On utilise notre axios configuré

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // APPEL AU BACKEND SYMFONY
      const response = await axios.post('/login_check', {
        email,
        password
      });

      // Si ça marche, on reçoit le token
      if (response.data.token) {
        login(response.data.token);
      }
    } catch (err) {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Connexion</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-black"
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-black"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-bold"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}