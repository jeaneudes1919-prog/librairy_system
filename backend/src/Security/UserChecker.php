<?php

namespace App\Security;

use App\Entity\Utilisateur;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof Utilisateur) {
            return;
        }

        // On vérifie le statut avec le nouveau getter
        if ($user->getIsBlocked()) {
            throw new CustomUserMessageAccountStatusException('Votre compte est bloqué.');
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
        // Rien ici
    }
}