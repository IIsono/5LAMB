# Blogify - Plateforme de Blogging AWS Serverless

Application de blogging construite avec AWS Lambda, API Gateway, DynamoDB, Cognito et S3.

## Prérequis

- [Terraform](https://www.terraform.io/downloads) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configuré avec vos credentials
- [Node.js](https://nodejs.org/) >= 20.x
- PowerShell (pour Windows)
- Bash et `zip` (pour Linux/Mac)

## Structure du Projet

```
blogify/
├── infrastructure/     # Configuration Terraform
│   ├── main.tf
│   ├── lambdas.tf
│   ├── api-routes.tf
│   ├── dynamodb.tf
│   ├── cognito.tf
│   └── s3.tf
└── lambdas/           # Code des fonctions Lambda
    ├── build.ps1      # Script de build (Windows)
    ├── build.sh       # Script de build (Linux/Mac)
    ├── dist/          # Packages ZIP (généré)
    └── *.js           # Fonctions Lambda
```

## Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd 5LAMB
```

### 2. Configurer AWS CLI

```bash
aws configure
```

Entrez vos credentials AWS (Access Key ID, Secret Access Key, région par défaut).

### 3. Builder les Lambdas

**Windows (PowerShell):**
```powershell
cd blogify/lambdas
powershell -ExecutionPolicy Bypass -File build.ps1
```

**Linux/Mac (Bash):**
```bash
cd blogify/lambdas
chmod +x build.sh
./build.sh
```

Cela crée le dossier `dist/` avec tous les packages ZIP des fonctions Lambda.

### 4. Déployer l'infrastructure

```bash
cd ../infrastructure
terraform init
terraform plan
terraform apply
```

Tapez `yes` pour confirmer le déploiement.

### 5. Récupérer les informations de déploiement

Après le déploiement, Terraform affiche:
- **API Gateway URL** : L'URL de votre API
- **Cognito User Pool ID** : Pour l'authentification
- **Cognito Client ID** : Pour l'authentification

## Utilisation

### Endpoints API

L'API est disponible à l'URL fournie par Terraform.

#### Authentification

- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter

#### Posts

- `GET /posts` - Liste des posts
- `GET /posts/{postId}` - Détails d'un post
- `POST /posts` - Créer un post (authentifié)
- `PUT /posts/{postId}` - Modifier un post (authentifié)
- `DELETE /posts/{postId}` - Supprimer un post (authentifié)
- `GET /posts/search?q=terme` - Rechercher des posts

#### Commentaires

- `GET /posts/{postId}/comments` - Liste des commentaires
- `POST /posts/{postId}/comments` - Créer un commentaire (authentifié)

#### Profil Utilisateur

- `GET /profile` - Voir son profil (authentifié)
- `PUT /profile` - Modifier son profil (authentifié)
- `GET /users/{userId}` - Voir le profil public d'un utilisateur
- `DELETE /account` - Supprimer son compte (authentifié)
- `POST /account/change-password` - Changer son mot de passe (authentifié)

#### Abonnements

- `POST /subscriptions/follow` - Suivre un utilisateur (authentifié)
- `POST /subscriptions/unfollow` - Ne plus suivre un utilisateur (authentifié)
- `GET /subscriptions/following` - Liste des utilisateurs suivis (authentifié)
- `GET /subscriptions/followers` - Liste de ses abonnés (authentifié)

#### Media

- `POST /media` - Uploader une image (authentifié)
- `GET /media/{mediaId}` - Récupérer les infos d'un media

## Mise à jour

Après avoir modifié le code des Lambdas:

**Windows:**
```powershell
# 1. Rebuilder les packages
cd blogify/lambdas
powershell -ExecutionPolicy Bypass -File build.ps1

# 2. Redéployer
cd ../infrastructure
terraform apply
```

**Linux/Mac:**
```bash
# 1. Rebuilder les packages
cd blogify/lambdas
./build.sh

# 2. Redéployer
cd ../infrastructure
terraform apply
```

## Rôles Utilisateurs

- **user** : Peut créer des posts et commentaires
- **editor** : Peut modérer les commentaires
- **admin** : Accès complet

## Nettoyage

Pour supprimer toute l'infrastructure:

```bash
cd blogify/infrastructure
terraform destroy
```

Tapez `yes` pour confirmer la suppression.

## Coûts AWS

Cette application utilise des services AWS qui peuvent engendrer des coûts:
- Lambda (gratuit jusqu'à 1M de requêtes/mois)
- API Gateway (gratuit jusqu'à 1M d'appels/mois)
- DynamoDB (gratuit jusqu'à 25 Go et 200M requêtes/mois)
- S3 (gratuit jusqu'à 5 Go)
- Cognito (gratuit jusqu'à 50k utilisateurs actifs/mois)

La plupart des usages de développement restent dans les limites gratuites.
