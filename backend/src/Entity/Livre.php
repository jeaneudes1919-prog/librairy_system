<?php

namespace App\Entity;

use App\Repository\LivreRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\ApiFilter; // <--- IMPORTER CA
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter; // <--- IMPORTER CA
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: LivreRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(), // Public : tout le monde peut voir la liste
        new Get(),           // Public : tout le monde peut voir un livre
        new Post(security: "is_granted('ROLE_ADMIN')"), // Seul l'admin crée
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')"),
        new Delete(security: "is_granted('ROLE_ADMIN')")
    ],
    normalizationContext: ['groups' => ['livre:read']],
    denormalizationContext: ['groups' => ['livre:write']]
)]
// AJOUT MAJEUR : Le filtre pour la recherche par titre !
// 'partial' veut dire : chercher "Potter" trouve "Harry Potter"
#[ApiFilter(SearchFilter::class, properties: ['titre' => 'partial', 'auteur' => 'partial'])]
class Livre
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['livre:read', 'demande:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['livre:read', 'livre:write', 'demande:read'])]
    #[Assert\NotBlank]
    private ?string $titre = null;

    #[ORM\Column(length: 255)]
    #[Groups(['livre:read', 'livre:write', 'demande:read'])]
    #[Assert\NotBlank]
    private ?string $auteur = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['livre:read', 'livre:write'])]
    private ?string $isbn = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['livre:read', 'livre:write'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['livre:read', 'livre:write'])]
    private ?bool $disponible = true;

    // --- GETTERS ET SETTERS ---
    public function getId(): ?int { return $this->id; }
    
    public function getTitre(): ?string { return $this->titre; }
    public function setTitre(string $titre): self { $this->titre = $titre; return $this; }
    
    public function getAuteur(): ?string { return $this->auteur; }
    public function setAuteur(string $auteur): self { $this->auteur = $auteur; return $this; }
    
    public function getIsbn(): ?string { return $this->isbn; }
    public function setIsbn(?string $isbn): self { $this->isbn = $isbn; return $this; }
    
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): self { $this->description = $description; return $this; }
    
    public function isDisponible(): ?bool { return $this->disponible; }
    public function setDisponible(bool $disponible): self { $this->disponible = $disponible; return $this; }
}