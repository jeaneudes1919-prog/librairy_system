<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Utilisateur;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Processeur d'état pour le hachage des mots de passe.
 * Correction : Empêche le double hachage lors des opérations de mise à jour (PATCH/PUT).
 */
class UserPasswordHasher implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persistProcessor,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Utilisateur) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // On récupère l'ancienne version de l'utilisateur avant la modification (si elle existe)
        $previousData = $context['previous_data'] ?? null;
        $newPassword = $data->getPassword();

        /**
         * LOGIQUE DE PROTECTION :
         * On ne hache le mot de passe QUE dans deux cas :
         * 1. C'est une création (pas de previousData).
         * 2. Le mot de passe envoyé est DIFFÉRENT de celui déjà stocké en base.
         */
        $shouldHash = !$previousData || ($newPassword !== $previousData->getPassword());

        if ($shouldHash && $newPassword !== null && $newPassword !== '') {
            $hashedPassword = $this->passwordHasher->hashPassword($data, $newPassword);
            $data->setPassword($hashedPassword);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}