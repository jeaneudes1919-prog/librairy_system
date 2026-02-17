<?php

namespace App\Controller;

use App\Repository\LivreRepository;
use App\Repository\UtilisateurRepository;
use App\Repository\DemandeEmpruntRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/stats')]
class StatsController extends AbstractController
{
    #[Route('', name: 'api_stats', methods: ['GET'])]
    public function index(
        LivreRepository $livreRepo,
        UtilisateurRepository $userRepo,
        DemandeEmpruntRepository $demandeRepo
    ): JsonResponse {
        // On renvoie les stats
        return $this->json([
            'livres_empruntes' => $livreRepo->count(['disponible' => false]),
            'utilisateurs' => $userRepo->count([]),
            'demandes_en_attente' => $demandeRepo->count(['statut' => 'en_attente']),
        ]);
    }
}