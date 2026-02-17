# librairy_system
Cahier de Réalisation : Système de Gestion de Bibliothèque
1. Présentation du Projet

Ce projet consiste en une plateforme web complète permettant la gestion dématérialisée d'une bibliothèque. Développé en 48 heures, il répond à des exigences de performance, de sécurité et d'ergonomie, en séparant strictement le traitement des données (Backend) de l'interface utilisateur (Frontend).
2. Architecture Technique

Le choix des technologies a été dicté par le besoin de robustesse et de scalabilité :

    Frontend : Next.js 14+

        Utilisation du Server-Side Rendering (SSR) pour optimiser les performances d'affichage.

        Gestion d'état via les hooks React (useCallback, useEffect, useState) pour une interface fluide.

        Stylisation avec Tailwind CSS pour une approche Mobile-First et un design épuré.

    Backend : Symfony 7 & API Platform 3

        Architecture RESTful native.

        LexikJWTAuthentication pour une gestion de la sécurité par jetons (Stateless), évitant la surcharge des sessions serveur.

        Doctrine ORM pour l'abstraction et la sécurisation des échanges avec la base de données MySQL.

3. Fonctionnalités Implémentées
Authentification et Sécurité

    Authentification JWT : Sécurisation des endpoints par jetons. Seuls les utilisateurs authentifiés peuvent effectuer des demandes d'emprunt.

    User Checker (Le Vigile) : Implémentation d'un service de sécurité personnalisé qui intercepte chaque tentative de connexion. Si le compte est marqué comme bloqué en base de données, l'accès est refusé avant même la génération du jeton.

    Hachage Adaptatif : Utilisation d'un State Processor personnalisé pour la gestion des mots de passe. Le système détecte si un mot de passe est déjà haché afin d'éviter la corruption des données lors d'une simple modification de profil par l'administrateur.

Gestion des Livres et Emprunts

    Catalogue Dynamique : Recherche multicritère et affichage de la disponibilité en temps réel.

    Workflow d'Emprunt : Système à trois états (En attente, Accepté, Rendu). La validation d'un emprunt par un administrateur impacte directement la disponibilité de l'ouvrage.

    Dashboard d'Administration : Interface centralisée regroupant quatre indicateurs clés (Total livres, Emprunts actifs, Utilisateurs inscrits, Alertes en attente).

Ergonomie et Mobilité

    Responsive Design : Utilisation de conteneurs à défilement horizontal et de grilles adaptatives pour garantir que le dashboard reste fonctionnel sur smartphone et tablette.

    Optimistic UI : Mise à jour immédiate de l'interface lors d'une action (comme le blocage d'un utilisateur) pour améliorer le ressenti utilisateur, avec un système de "rollback" automatique en cas d'échec de la requête API.

4. Schéma de Données

La base de données repose sur trois entités principales liées par des relations relationnelles fortes :

    Utilisateur : Stocke les identifiants, les rôles et le statut de compte.

    Livre : Contient les métadonnées des ouvrages et l'état de disponibilité.

    DemandeEmprunt : Table de liaison gérant les relations Many-To-One entre utilisateurs et livres, incluant les dates et le statut de la transaction.

5. Commandes de Démarrage
Installation du Backend

Dans le répertoire backend/ :

    Installation des dépendances : composer install

    Création de la base de données : php bin/console doctrine:database:create

    Exécution des migrations : php bin/console doctrine:migrations:migrate

    Génération des clés de sécurité JWT : php bin/console lexik:jwt:generate-keypair

    Lancement du serveur :php -S localhost:8000 -t public

Installation du Frontend

Dans le répertoire frontend/ :

    Installation des packages : npm install

    Lancement de l'interface : npm run dev

    Accès au navigateur : http://localhost:3000

6. Choix d'Ingénierie (Le "Pourquoi")

    Pourquoi API Platform ? Pour bénéficier de la documentation SwaggerUI automatique, permettant aux développeurs tiers de tester les endpoints sans avoir besoin du code source frontend.

    Pourquoi le hachage intelligent ? Pour résoudre le bug récurrent où la modification d'un utilisateur par l'administrateur corrompait le mot de passe en hachant une valeur vide. Nous avons séparé la logique de mise à jour du statut de la logique de hachage.

    Pourquoi getIsBlocked() ? Pour assurer la compatibilité entre le format JSON attendu par Next.js et la sérialisation de Symfony, évitant ainsi les erreurs de synchronisation de l'interface.

Auteur : Jean-Eudes ATINDEHOU
Durée de réalisation : 48 heures.