export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  roles: string[];
}

export interface Book {
  id: number;
  titre: string;
  auteur: string;
  isbn?: string;
  description?: string;
  disponible: boolean;
  '@id'?: string; // Utilisé par API Platform
}

export interface BorrowRequest {
  id: number;
  demandeur: User; // Relation avec User
  livre: Book;     // Relation avec Book
  dateDemande: string;
  dateRetour?: string;
  statut: 'en_attente' | 'accepte' | 'refuse' | 'rendu';
}

export interface LoginResponse {
  token: string;
}