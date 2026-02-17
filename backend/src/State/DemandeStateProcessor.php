<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\DemandeEmprunt;
use App\Repository\DemandeEmpruntRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class DemandeStateProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persistProcessor,
        private readonly EntityManagerInterface $entityManager,
        private readonly DemandeEmpruntRepository $repository
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof DemandeEmprunt && $data->getLivre() && $data->getDemandeur()) {
            
            $livre = $data->getLivre();
            $statut = $data->getStatut();
            $demandeur = $data->getDemandeur();

            // --- 1. SÉCURITÉ POST (Création) ---
            if ($operation instanceof Post) {
                // Vérification si utilisateur bloqué
                if (method_exists($demandeur, 'isBlocked') && $demandeur->isBlocked()) {
                    throw new BadRequestHttpException("Votre compte est bloqué. Impossible d'emprunter.");
                }

                // Vérification doublon
                $enAttente = $this->repository->findOneBy([
                    'demandeur' => $demandeur,
                    'livre' => $livre,
                    'statut' => 'en_attente'
                ]);
                if ($enAttente) throw new BadRequestHttpException("Vous avez déjà demandé ce livre.");
            }

            // --- 2. SÉCURITÉ PATCH (Admin) ---
            if ($operation instanceof Patch) {
                if ($statut === 'accepte') {
                    if (!$livre->isDisponible()) {
                        throw new BadRequestHttpException("Livre déjà prêté.");
                    }
                    $livre->setDisponible(false);
                }
                elseif ($statut === 'rendu' || $statut === 'refuse') {
                    $livre->setDisponible(true);
                    if ($statut === 'rendu') $data->setDateRetour(new \DateTime());
                }
            }

            $this->entityManager->persist($livre);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}