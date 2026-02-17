<?php

namespace App\Entity;

use App\Repository\DemandeEmpruntRepository;
use App\State\DemandeStateProcessor;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter; // <--- AJOUT 1
use ApiPlatform\Metadata\ApiFilter;               // <--- AJOUT 2
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: DemandeEmpruntRepository::class)]
#[ApiResource(
    operations: [
        // AJOUT 3 : On autorise tout le monde (ROLE_USER) à chercher dans la collection
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Get(security: "is_granted('ROLE_ADMIN') or object.getDemandeur() == user"),
        new Post(processor: DemandeStateProcessor::class),
        new Patch(
            processor: DemandeStateProcessor::class, 
            security: "is_granted('ROLE_ADMIN')"
        )
    ],
    normalizationContext: ['groups' => ['demande:read']],
    denormalizationContext: ['groups' => ['demande:write']]
)]
// AJOUT 4 : On active le filtre pour pouvoir chercher ?demandeur.email=moi@gmail.com
#[ApiFilter(SearchFilter::class, properties: ['demandeur.email' => 'exact'])]
class DemandeEmprunt
{
    
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['demande:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['demande:read', 'demande:write'])]
    private ?Utilisateur $demandeur = null;

    #[ORM\ManyToOne(targetEntity: Livre::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['demande:read', 'demande:write'])]
    private ?Livre $livre = null;

    #[ORM\Column]
    #[Groups(['demande:read'])]
    private ?\DateTimeImmutable $dateDemande = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['demande:read', 'demande:write'])]
    private ?\DateTime $dateRetour = null;

    #[ORM\Column(length: 20)]
    #[Groups(['demande:read', 'demande:write'])]
    private ?string $statut = 'en_attente';

    public function __construct() {
        $this->dateDemande = new \DateTimeImmutable();
    }
    
    // ... Getters et Setters ...
    public function getId(): ?int { return $this->id; }
    public function getDemandeur(): ?Utilisateur { return $this->demandeur; }
    public function setDemandeur(?Utilisateur $demandeur): self { $this->demandeur = $demandeur; return $this; }
    public function getLivre(): ?Livre { return $this->livre; }
    public function setLivre(?Livre $livre): self { $this->livre = $livre; return $this; }
    public function getDateDemande(): ?\DateTimeImmutable { return $this->dateDemande; }
    public function setDateDemande(\DateTimeImmutable $date): self { $this->dateDemande = $date; return $this; }
    public function getDateRetour(): ?\DateTime { return $this->dateRetour; }
    public function setDateRetour(?\DateTime $dateRetour): self { $this->dateRetour = $dateRetour; return $this; }
    public function getStatut(): ?string { return $this->statut; }
    public function setStatut(string $statut): self { $this->statut = $statut; return $this; }
}