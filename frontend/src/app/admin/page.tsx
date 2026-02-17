'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, Book, Users, ClipboardList, Library,
  Trash2, PlusCircle, Ban, CheckCircle, AlertCircle, X
} from 'lucide-react';

// --- COMPOSANT NOTIFICATION (TOAST) ---
function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce z-50 border-2 ${
            type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-rose-600 border-rose-400 text-white'
        }`}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-black uppercase tracking-tight">{message}</p>
            <button onClick={onClose} className="ml-2 hover:scale-125 transition-transform"><X size={16} /></button>
        </div>
    );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'emprunts' | 'livres' | 'users'>('emprunts');
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  
  const [requests, setRequests] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [stats, setStats] = useState({ livres_empruntes: 0, utilisateurs: 0, demandes_en_attente: 0, livres_total: 0 });
  const [loading, setLoading] = useState(true);
  
  const [newBook, setNewBook] = useState({ titre: '', auteur: '', description: '', isbn: '' });
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const showNotify = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  useEffect(() => {
    if (user && !isAdmin) router.push('/');
  }, [user, isAdmin, router]);

  const extractData = (res: any) => {
    if (!res || !res.data) return [];
    return res.data['hydra:member'] || res.data['member'] || (Array.isArray(res.data) ? res.data : []);
  };

  // --- CHARGEMENT DES DONNÉES (FIXÉ) ---
  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    try {
        const [statsRes, reqRes, booksRes, usersRes] = await Promise.all([
            axios.get('/stats').catch(() => ({ data: {} })),
            axios.get('/demande_emprunts'),
            axios.get('/livres'),
            axios.get('/utilisateurs')
        ]);

        const books = extractData(booksRes);
        const reqData = extractData(reqRes);
        const users = extractData(usersRes);

        setBooksList(books);
        setRequests(reqData);
        setStats({ ...statsRes.data, livres_total: books.length });

        // NORMALISATION : On s'assure que React voit toujours 'isBlocked'
        setUsersList(users.map((u: any) => ({
            ...u,
            isBlocked: u.isBlocked ?? u.is_blocked ?? false, // Lit les deux formats
            stats: {
                emprunts: reqData.filter((r: any) => r.statut === 'accepte' && (r.demandeur?.id === u.id || r.demandeur === `/api/utilisateurs/${u.id}`)).length,
                demandes: reqData.filter((r: any) => r.statut === 'en_attente' && (r.demandeur?.id === u.id || r.demandeur === `/api/utilisateurs/${u.id}`)).length
            }
        })));
    } catch (e) { console.error("Chargement échoué", e); }
    finally { setLoading(false); }
  }, [isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- ACTIONS ---

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`/demande_emprunts/${id}`, { statut: newStatus }, 
        { headers: { 'Content-Type': 'application/merge-patch+json' } });
      showNotify("Statut mis à jour !");
      loadData();
    } catch (e) { showNotify("Erreur mise à jour", "error"); }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await axios.post('/livres', { ...newBook, disponible: true }, { headers: { 'Content-Type': 'application/ld+json' } });
        setNewBook({ titre: '', auteur: '', description: '', isbn: '' });
        showNotify("Livre ajouté !");
        loadData();
    } catch (err) { showNotify("Erreur d'ajout", "error"); }
  };

  // --- BLOCAGE (FIXÉ) ---
  const toggleUserBlock = async (u: any) => {
    const nextState = !u.isBlocked;
    
    // 1. Optimistic UI
    setUsersList(prev => prev.map(user => user.id === u.id ? { ...user, isBlocked: nextState } : user));

    try {
        // 2. Envoi serveur (on envoie les deux noms de clé par sécurité)
        await axios.patch(`/utilisateurs/${u.id}`, 
            { isBlocked: nextState, is_blocked: nextState }, 
            { headers: { 'Content-Type': 'application/merge-patch+json' } }
        );
        showNotify(nextState ? "Utilisateur BLOQUÉ" : "Utilisateur DÉBLOQUÉ");
        // On ne rappelle pas forcément loadData ici pour éviter le clignotement
    } catch (e) { 
        // 3. Rollback
        setUsersList(prev => prev.map(user => user.id === u.id ? { ...user, isBlocked: !nextState } : user));
        showNotify("Erreur serveur", "error"); 
    }
  };

  const deleteItem = async (endpoint: string, id: number) => {
    if(!confirm("Supprimer ?")) return;
    try {
        await axios.delete(`/${endpoint}/${id}`);
        showNotify("Supprimé !");
        loadData();
    } catch (e) { showNotify("Action impossible", "error"); }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans text-slate-900">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="bg-blue-600 p-5 rounded-[2rem] shadow-2xl shadow-blue-200 rotate-3 transition-transform hover:rotate-0">
                <LayoutDashboard className="h-10 w-10 text-white" />
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Admin Panel</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Gestion Bibliothèque</p>
            </div>
        </div>

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard title="Total" value={stats.livres_total} color="purple" icon={<Library size={30}/>} />
            <StatCard title="Sortis" value={stats.livres_empruntes} color="blue" icon={<Book size={30}/>} />
            <StatCard title="Membres" value={stats.utilisateurs} color="green" icon={<Users size={30}/>} />
            <StatCard title="Alertes" value={stats.demandes_en_attente} color="amber" icon={<ClipboardList size={30}/>} />
        </div>

        {/* --- TABS --- */}
        <div className="flex flex-wrap gap-2 mb-10 bg-slate-200/50 p-2 rounded-[2rem] w-fit mx-auto md:mx-0 border border-slate-200 shadow-inner">
            <TabBtn active={activeTab === 'emprunts'} onClick={() => setActiveTab('emprunts')} label="Emprunts" />
            <TabBtn active={activeTab === 'livres'} onClick={() => setActiveTab('livres')} label="Catalogue" />
            <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Membres" />
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            
            {/* 1. EMPRUNTS */}
            {activeTab === 'emprunts' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                <th className="p-6 md:p-8">Livre</th>
                                <th className="p-6 md:p-8">Membre</th>
                                <th className="p-6 md:p-8 text-center">Statut</th>
                                <th className="p-6 md:p-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {requests.map(req => (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-6 md:p-8 font-bold text-slate-800">{req.livre?.titre}</td>
                                    <td className="p-6 md:p-8 text-slate-500">{req.demandeur?.nom} {req.demandeur?.prenom}</td>
                                    <td className="p-6 md:p-8 text-center"><StatusBadge status={req.statut} /></td>
                                    <td className="p-6 md:p-8 text-right space-x-2">
                                        {req.statut === 'en_attente' && (
                                            <>
                                                <button onClick={() => updateStatus(req.id, 'accepte')} className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-black">OK</button>
                                                <button onClick={() => updateStatus(req.id, 'refuse')} className="bg-rose-500 text-white px-3 py-1 rounded-lg text-xs font-black">NON</button>
                                            </>
                                        )}
                                        {req.statut === 'accepte' && <button onClick={() => updateStatus(req.id, 'rendu')} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black">RENDU</button>}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && <EmptyRow colSpan={4} />}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 2. LIVRES */}
            {activeTab === 'livres' && (
                <div className="p-6 md:p-8">
                    <form onSubmit={handleAddBook} className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <input className="flex-1 p-4 rounded-2xl border-0 shadow-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 text-black" value={newBook.titre} onChange={e => setNewBook({...newBook, titre: e.target.value})} placeholder="Titre du livre..." />
                        <input className="flex-1 p-4 rounded-2xl border-0 shadow-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 text-black" value={newBook.auteur} onChange={e => setNewBook({...newBook, auteur: e.target.value})} placeholder="Auteur..." />
                        <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2"><PlusCircle size={16}/> Ajouter</button>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-slate-50 border-b">
                                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]"><th className="p-6">Titre</th><th className="p-6">Auteur</th><th className="p-6 text-center">Dispo</th><th className="p-6 text-right">Suppr.</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {booksList.map(b => (
                                    <tr key={b.id} className="hover:bg-slate-50">
                                        <td className="p-6 font-bold text-slate-800">{b.titre}</td>
                                        <td className="p-6 text-slate-500">{b.auteur}</td>
                                        <td className="p-6 text-center"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${b.disponible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{b.disponible ? 'OUI' : 'NON'}</span></td>
                                        <td className="p-6 text-right"><button onClick={() => deleteItem('livres', b.id)} className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={20}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 3. UTILISATEURS */}
            {activeTab === 'users' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                <th className="p-6 md:p-8">Identité</th>
                                <th className="p-6 md:p-8 text-center">Livres</th>
                                <th className="p-6 md:p-8 text-center">État</th>
                                <th className="p-6 md:p-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {usersList.map(u => (
                                <tr key={u.id} className={`transition-all ${u.isBlocked ? 'bg-rose-50/40' : 'hover:bg-slate-50'}`}>
                                    <td className="p-6 md:p-8">
                                        <div className="font-black text-lg text-slate-900">{u.prenom} {u.nom}</div>
                                        <div className="text-xs font-bold text-slate-400">{u.email}</div>
                                    </td>
                                    <td className="p-6 md:p-8 text-center">
                                        <span className="text-xl font-black text-blue-600">{u.stats?.emprunts || 0}</span>
                                    </td>
                                    <td className="p-6 md:p-8 text-center">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 ${
                                            u.isBlocked ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                        }`}>
                                            {u.isBlocked ? <><Ban size={14}/> Bloqué</> : <><CheckCircle size={14}/> Actif</>}
                                        </div>
                                    </td>
                                    <td className="p-6 md:p-8 text-right space-x-4 flex justify-end items-center">
                                        <button 
                                            onClick={() => toggleUserBlock(u)} 
                                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                                                u.isBlocked 
                                                ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100' 
                                                : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white'
                                            }`}
                                        >
                                            {u.isBlocked ? "Débloquer" : "Bloquer"}
                                        </button>
                                        <button onClick={() => deleteItem('utilisateurs', u.id)} className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={20}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function StatCard({ title, value, color, icon }: any) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-800 border-blue-200', green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        amber: 'bg-amber-50 text-amber-800 border-amber-200', purple: 'bg-purple-50 text-purple-800 border-purple-200'
    };
    return (
        <div className={`p-8 rounded-[2.5rem] border-2 shadow-2xl transition-all hover:-translate-y-2 ${colors[color]}`}>
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{title}</p>
                <div className="p-4 bg-white/60 rounded-3xl shadow-inner border border-white/40">{icon}</div>
            </div>
            <p className="text-5xl md:text-6xl font-black tracking-tighter">{value}</p>
        </div>
    );
}

function TabBtn({ active, onClick, label }: any) {
    return (
        <button onClick={onClick} className={`px-6 md:px-10 py-3 md:py-4 rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
            active ? 'bg-slate-900 text-white shadow-2xl shadow-slate-400 scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-900'
        }`}>
            {label}
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = { accepte: 'bg-emerald-100 text-emerald-700 border-emerald-200', refuse: 'bg-rose-100 text-rose-700 border-rose-200', rendu: 'bg-slate-100 text-slate-500 border-slate-200', en_attente: 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse' };
    return <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border-2 ${styles[status] || 'bg-slate-100'}`}>{status.replace('_', ' ')}</span>;
}

function EmptyRow({ colSpan }: { colSpan: number }) {
    return <tr><td colSpan={colSpan} className="p-32 text-center text-slate-300 italic font-black uppercase tracking-[0.3em] text-xs">Aucune donnée</td></tr>;
}