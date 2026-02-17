<?php

namespace App\DataFixtures;

use App\Entity\Utilisateur;
use App\Entity\Livre;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $hasher;

    public function __construct(UserPasswordHasherInterface $hasher)
    {
        $this->hasher = $hasher;
    }

    public function load(ObjectManager $manager): void
    {
        // 1. Création de l'Administrateur
        $admin = new Utilisateur();
        $admin->setEmail('admin@biblio.com');
        $admin->setRoles(['ROLE_ADMIN']);
        // IMPORTANT : On ajoute nom et prénom car ils sont obligatoires maintenant
        $admin->setNom('Admin');
        $admin->setPrenom('Systeme');
        
        $passwordAdmin = $this->hasher->hashPassword($admin, 'password123');
        $admin->setPassword($passwordAdmin);
        $manager->persist($admin);

        // 2. Création d'un Utilisateur standard
        $user = new Utilisateur();
        $user->setEmail('jean@biblio.com');
        $user->setRoles(['ROLE_USER']);
        // IMPORTANT : Ici aussi
        $user->setNom('Dupont');
        $user->setPrenom('Jean');

        $passwordUser = $this->hasher->hashPassword($user, 'password123');
        $user->setPassword($passwordUser);
        $manager->persist($user);

        // 3. Création des Livres
        $livres = [
            ['titre' => 'Le Petit Prince', 'auteur' => 'Antoine de Saint-Exupéry', 'isbn' => '978-0156012195'],
            ['titre' => '1984', 'auteur' => 'George Orwell', 'isbn' => '978-0451524935'],
            ['titre' => 'Harry Potter', 'auteur' => 'J.K. Rowling', 'isbn' => '978-2070541270'],
            ['titre' => 'L\'Étranger', 'auteur' => 'Albert Camus', 'isbn' => '978-0679720201'],
        ];

        foreach ($livres as $data) {
            $livre = new Livre();
            $livre->setTitre($data['titre']);
            $livre->setAuteur($data['auteur']);
            $livre->setIsbn($data['isbn']);
            $livre->setDescription('Un grand classique.');
            $livre->setDisponible(true);
            $manager->persist($livre);
        }

        $manager->flush();
    }
}