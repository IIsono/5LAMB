# Blogify - Présentation du Projet

## Introduction

Blogify est une plateforme de blogging headless développée pour répondre aux besoins des créateurs de contenu modernes qui recherchent flexibilité, scalabilité et performance.

## Objectifs du projet

1. Fournir une API REST complète pour la gestion de contenu
2. Assurer une scalabilité automatique et illimitée
3. Minimiser les coûts d'infrastructure
4. Garantir la sécurité des données et des accès
5. Permettre l'intégration avec n'importe quel frontend

## Architecture Serverless

### Pourquoi serverless?

1. **Coûts optimisés**: Pay-per-use, pas de serveur idle
2. **Scalabilité automatique**: De 0 à millions de requêtes sans configuration
3. **Maintenance réduite**: AWS gère l'infrastructure
4. **Haute disponibilité**: Multi-AZ par défaut
5. **Performance**: Latence minimale avec Lambda@Edge possible

### Composants sélectionnés

#### AWS Lambda
- Exécution de code sans serveur
- Auto-scaling instantané
- Facturation à la milliseconde
- Intégration native avec autres services AWS

#### API Gateway HTTP API
- 71% moins cher que REST API
- Performance améliorée
- JWT authorizer natif
- CORS intégré

#### DynamoDB
- NoSQL serverless
- Latence single-digit milliseconds
- Throughput illimité en mode on-demand
- Global tables pour multi-region

#### S3 + Presigned URLs
- Stockage illimité
- Upload/download direct (bypass Lambda)
- Coût très faible
- Haute durabilité (99.999999999%)

#### Cognito
- Service d'authentification managé
- JWT tokens
- User pools avec attributs custom
- Gratuit jusqu'à 50k MAU

## Design API

### Principes REST

1. **Resources-based**: /posts, /media
2. **HTTP verbs**: GET, POST, PUT, DELETE
3. **Status codes**: 200, 201, 204, 400, 403, 404, 500
4. **Stateless**: Chaque requête est indépendante
5. **JSON**: Format standard pour requêtes/réponses

### Endpoints principaux

```
POST   /posts          - Créer un post
GET    /posts          - Lister les posts
GET    /posts/{id}     - Récupérer un post
PUT    /posts/{id}     - Modifier un post
DELETE /posts/{id}     - Supprimer un post

POST   /media          - Obtenir presigned URL
GET    /media/{id}     - Récupérer métadonnées média
```

### Authentification

- JWT tokens via Cognito
- Header: `Authorization: Bearer {token}`
- Routes publiques: GET /posts, GET /posts/{id}, GET /media/{id}
- Routes protégées: POST, PUT, DELETE

### Authorization

- Vérification ownership dans Lambda
- Role-based access control (RBAC)
- Attribut custom dans Cognito: role (admin, editor, guest_author)

## Modèle de données

### Posts

```javascript
{
  postId: UUID,
  userId: UUID,
  title: String,
  content: String,
  status: "draft" | "published" | "archived",
  tags: [String],
  mediaUrls: [String],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  publishedAt: Timestamp | null
}
```

### Composite Key Design

- PK: postId
- SK: createdAt
- Avantages: versioning possible, queries efficaces
- GSI: userId-createdAt-index pour lister posts par user

## Sécurité

### Layers de sécurité

1. **Network**: VPC non nécessaire (services managés)
2. **API**: JWT authorizer, CORS policy
3. **Application**: Validation input, ownership checks
4. **Data**: Encryption at rest + in transit
5. **IAM**: Least privilege principle

### Mesures implémentées

- S3 block public access
- DynamoDB encryption at rest
- HTTPS only (TLS 1.2+)
- Presigned URLs avec expiration
- Lambda execution role minimal
- Cognito password policy stricte

## Performance

### Métriques cibles

- Cold start Lambda: <500ms
- Warm execution: <50ms
- DynamoDB read: <10ms
- API Gateway latency: <50ms
- End-to-end: <200ms

### Optimisations

1. **Lambda**: Node.js 20.x, memory tuning
2. **DynamoDB**: GSI pour queries, on-demand mode
3. **S3**: Presigned URLs = direct upload
4. **API Gateway**: HTTP API au lieu de REST API

## Scalabilité et Recommandations

### Scaling actuel (automatique)

- Lambda: 1000 concurrent executions
- DynamoDB: illimité
- S3: illimité
- API Gateway: 10000 req/s

### Optimisations court terme

1. **CloudFront devant S3**
   - CDN global
   - Cache media
   - Réduction latence 80%

2. **Lambda layers**
   - Code partagé (AWS SDK)
   - Réduction taille package
   - Deploy plus rapide

3. **DynamoDB DAX**
   - In-memory cache
   - Microsecond latency
   - Pour queries très fréquentes

### Optimisations moyen terme

1. **OpenSearch**
   - Full-text search
   - Faceted search
   - Autocomplete

2. **ElastiCache**
   - Cache API responses
   - Réduction coûts DynamoDB
   - TTL configurable

3. **EventBridge + SQS**
   - Processing asynchrone
   - Notifications subscribers
   - Découplage services

### Architecture avancée

1. **Multi-region**
   - DynamoDB Global Tables
   - Route53 geo-routing
   - Haute disponibilité

2. **Lambda@Edge**
   - Personnalisation CDN
   - A/B testing
   - Geo-blocking

3. **Step Functions**
   - Workflows complexes
   - Publication programmée
   - Orchestration

## Monitoring et Observabilité

### Métriques clés

1. **Business**: Posts created/day, Active users
2. **Performance**: Latency p50/p99, Error rate
3. **Cost**: Lambda invocations, DynamoDB RCU/WCU
4. **Security**: Failed auth attempts, 403 errors

### Outils

- CloudWatch Logs + Insights
- CloudWatch Metrics + Alarms
- X-Ray pour tracing distribué
- CloudTrail pour audit

## Coûts et ROI

### Estimation mensuelle

**Scénario bas (startup)**
- 100k requêtes API
- 10GB DynamoDB
- 5GB S3
- 1k utilisateurs actifs

Coût: ~$1/mois

**Scénario moyen (croissance)**
- 10M requêtes API
- 100GB DynamoDB
- 100GB S3
- 10k utilisateurs actifs

Coût: ~$50/mois

**Scénario élevé (scale)**
- 100M requêtes API
- 1TB DynamoDB
- 1TB S3
- 100k utilisateurs actifs

Coût: ~$500/mois

### Comparaison vs serveurs traditionnels

- EC2 (t3.medium): $30/mois minimum
- RDS (db.t3.micro): $15/mois minimum
- Load Balancer: $16/mois minimum

Total traditionnel: $61/mois MINIMUM (sans scaling)

**Blogify serverless**: $1-50/mois selon usage réel

## Améliorations futures

### Améliorations futures

### Features bonus implémentées

1. **Comments système avec modération**
   - Table Comments dans DynamoDB
   - Statuts: pending, approved, rejected
   - Modération réservée aux admin/editor
   - API publique pour créer des commentaires

2. **Search full-text**
   - Recherche par mot-clé (title + content)
   - Recherche par tags
   - DynamoDB Scan avec FilterExpression
   - Pour volumes élevés: migrer vers OpenSearch

3. **Notifications**
   - SNS topic pour emails
   - DynamoDB Streams sur table Posts
   - Lambda trigger automatique sur publication
   - Système subscribe/unsubscribe

### Features additionnelles futures

1. **Analytics avancés**
   - Kinesis Data Streams
   - Lambda pour processing
   - S3 pour storage
   - QuickSight pour dashboards

### DevOps

1. **CI/CD Pipeline**
   - GitHub Actions / CodePipeline
   - Tests automatisés
   - Deploy staging + prod

2. **Tests**
   - Unit tests (Jest)
   - Integration tests
   - Load tests (Locust)

3. **Documentation**
   - OpenAPI/Swagger spec
   - API changelog
   - SDK generation

## Conclusion

Blogify démontre comment une architecture serverless AWS peut fournir:

- **Scalabilité**: De 0 à millions d'utilisateurs sans changement d'architecture
- **Coûts**: Pay-per-use avec coûts très bas au démarrage
- **Performance**: Latence sub-100ms pour la majorité des requêtes
- **Sécurité**: Multiple layers avec best practices AWS
- **Flexibilité**: API headless pour n'importe quel frontend

Le choix de l'architecture serverless permet à Blogify de se concentrer sur les features business plutôt que sur la gestion d'infrastructure, tout en offrant une base solide pour scaler globalement.
