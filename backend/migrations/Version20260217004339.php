<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260217004339 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE demande_emprunt (id INT AUTO_INCREMENT NOT NULL, date_demande DATETIME NOT NULL, date_retour DATETIME DEFAULT NULL, statut VARCHAR(20) NOT NULL, demandeur_id INT NOT NULL, livre_id INT NOT NULL, INDEX IDX_6B7CA7895A6EE59 (demandeur_id), INDEX IDX_6B7CA7837D925CB (livre_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE livre (id INT AUTO_INCREMENT NOT NULL, titre VARCHAR(255) NOT NULL, auteur VARCHAR(255) NOT NULL, isbn VARCHAR(20) DEFAULT NULL, description LONGTEXT DEFAULT NULL, disponible TINYINT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE utilisateur (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, nom VARCHAR(255) NOT NULL, prenom VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_1D1C63B3E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE demande_emprunt ADD CONSTRAINT FK_6B7CA7895A6EE59 FOREIGN KEY (demandeur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE demande_emprunt ADD CONSTRAINT FK_6B7CA7837D925CB FOREIGN KEY (livre_id) REFERENCES livre (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE demande_emprunt DROP FOREIGN KEY FK_6B7CA7895A6EE59');
        $this->addSql('ALTER TABLE demande_emprunt DROP FOREIGN KEY FK_6B7CA7837D925CB');
        $this->addSql('DROP TABLE demande_emprunt');
        $this->addSql('DROP TABLE livre');
        $this->addSql('DROP TABLE utilisateur');
    }
}
