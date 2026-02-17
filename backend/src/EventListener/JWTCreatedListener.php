<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Security\Core\User\UserInterface;

// On branche l'écouteur
#[AsEventListener(event: 'lexik_jwt_authentication.on_jwt_created')]
class JWTCreatedListener
{
    /**
     * Symfony cherche par défaut une méthode qui porte le nom de l'event "camelCase"
     */
    public function onLexikJwtAuthenticationOnJwtCreated(JWTCreatedEvent $event): void
    {
        $payload = $event->getData();
        $user = $event->getUser();

        if ($user instanceof UserInterface && method_exists($user, 'getId')) {
            $payload['id'] = $user->getId();
        }

        $event->setData($payload);
    }
}