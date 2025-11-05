# Blogify - Headless Blogging Platform

Plateforme de blogging headless serverless construite sur AWS Lambda, permettant aux créateurs de contenu de gérer leurs blogs via une API REST flexible.

## Caractéristiques

### Core Features
- Authentification JWT via AWS Cognito
- CRUD complet pour les posts de blog
- Upload et gestion de médias via S3
- API REST complète via API Gateway
- Architecture 100% serverless

### Bonus Features
- Système de commentaires avec modération
- Recherche full-text par mot-clé et tags
- Notifications email pour nouveaux posts (SNS)
- Abonnements/désabonnements utilisateurs

### Sécurité
- Role-based access control (admin, editor, guest_author)
- JWT authentication
- Presigned URLs pour sécuriser les uploads S3
- IAM roles avec permissions minimales

### Performance
- Latence <50ms pour requêtes chaudes
- Auto-scaling illimité
- DynamoDB avec accès single-digit milliseconds
- Upload média direct vers S3

## Architecture

```
Client ──> API Gateway ──> Lambda Functions ──> DynamoDB
                   │                │
                   │                └──────────> S3
                   │
                   └──> Cognito (Auth)
```

## Structure du projet

```
blogify/
├── lambdas/           # Lambda functions
│   ├── createPost.js
│   ├── getPost.js
│   ├── listPosts.js
│   ├── updatePost.js
│   ├── deletePost.js
│   ├── uploadMedia.js
│   ├── getMedia.js
│   └── package.json
├── infrastructure/    # Terraform IaC
│   ├── main.tf
│   ├── lambdas.tf
│   ├── api-routes.tf
│   ├── variables.tf
│   └── outputs.tf
└── docs/             # Documentation
    ├── API.md
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── data-model.md
```

## Déploiement rapide

```bash
cd infrastructure
terraform init
terraform apply

terraform output
```

Voir [DEPLOYMENT.md](docs/DEPLOYMENT.md) pour les détails.

## API Endpoints

### Posts
- `POST /posts` - Créer un post (auth)
- `GET /posts` - Lister les posts
- `GET /posts/{postId}` - Récupérer un post
- `PUT /posts/{postId}` - Modifier un post (auth)
- `DELETE /posts/{postId}` - Supprimer un post (auth)
- `GET /posts/search` - Rechercher des posts

### Media
- `POST /media` - Obtenir presigned URL (auth)
- `GET /media/{mediaId}` - Récupérer un média

### Comments
- `POST /posts/{postId}/comments` - Créer un commentaire
- `GET /posts/{postId}/comments` - Lister les commentaires
- `PUT /comments/{commentId}/moderate` - Modérer (auth admin/editor)

### Subscriptions
- `POST /subscriptions/{action}` - Subscribe/Unsubscribe

Voir [API.md](docs/API.md) pour la documentation complète.

## Stack Technique

- **Runtime**: Node.js 20.x
- **Compute**: AWS Lambda
- **API**: API Gateway HTTP API
- **Database**: DynamoDB
- **Storage**: S3
- **Auth**: Cognito
- **IaC**: Terraform

## Coûts estimés

~$3/mois pour usage léger:
- 1M requêtes API
- 25GB DynamoDB
- 20GB S3
- <50k utilisateurs actifs

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Data Model](docs/data-model.md)

## Scalabilité

Le système scale automatiquement:
- Lambda: jusqu'à 1000 executions concurrentes
- DynamoDB: throughput illimité (on-demand)
- S3: pas de limite
- API Gateway: 10000 req/s

## Améliorations futures

- [ ] CloudFront pour CDN
- [ ] OpenSearch pour recherche avancée
- [ ] Step Functions pour workflows
- [ ] Multi-region deployment
- [ ] CI/CD pipeline

## License

MIT
