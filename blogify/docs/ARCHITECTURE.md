# Architecture Système - Blogify

## Vue d'ensemble

Blogify est une plateforme de blogging headless basée sur une architecture serverless AWS, permettant une intégration flexible avec n'importe quel frontend.

## Composants principaux

### 1. API Gateway (HTTP API)
- Point d'entrée unique pour toutes les requêtes
- Gestion CORS intégrée
- Authorizer JWT via Cognito
- Routes RESTful

### 2. AWS Lambda
- Fonctions sans état pour chaque opération CRUD
- Runtime Node.js 20.x
- Exécution à la demande
- Auto-scaling automatique

### 3. Amazon DynamoDB
- Base de données NoSQL serverless
- Tables: Users, Posts, Media
- GSI pour requêtes optimisées
- Mode PAY_PER_REQUEST pour scaling automatique

### 4. Amazon S3
- Stockage de médias (images, vidéos)
- Signed URLs pour upload/download sécurisés
- Versioning désactivé par défaut
- Accès public bloqué

### 5. Amazon Cognito
- Authentification utilisateurs
- JWT tokens
- Attributs personnalisés (role)
- Password policy configurée

## Flux de données

### Création d'un post
1. Client → API Gateway (POST /posts)
2. API Gateway → JWT Authorizer (Cognito)
3. Lambda createPost → DynamoDB Posts
4. Réponse au client

### Upload média
1. Client → API Gateway (POST /media)
2. Lambda uploadMedia génère presigned URL S3
3. Client upload directement vers S3
4. Métadonnées stockées dans DynamoDB Media

### Lecture publique
1. Client → API Gateway (GET /posts)
2. Lambda listPosts → DynamoDB Query/Scan
3. Réponse au client (pas d'auth requise)

## Sécurité

### Authentication & Authorization
- Cognito JWT pour authentification
- Claims JWT contiennent userId et role
- Vérification ownership dans Lambda (userId)
- Routes publiques vs protégées

### IAM Roles
- Lambda execution role avec permissions minimales
- Accès DynamoDB limité aux tables spécifiques
- Accès S3 limité au bucket média

### Données
- Encryption at rest (DynamoDB et S3)
- Encryption in transit (HTTPS/TLS)
- Presigned URLs avec expiration courte (1h)

## Modèle de données

### Posts Table
```
PK: postId (UUID)
SK: createdAt (Timestamp)
GSI: userId-createdAt-index
```

Permet:
- Get par postId + createdAt
- Query par userId (tous les posts d'un user)
- Scan pour lister tous les posts

### Users Table
```
PK: userId (UUID)
```

Utilisé pour stocker métadonnées additionnelles si nécessaire.

### Media Table
```
PK: mediaId (UUID)
```

Mapping entre mediaId et s3Key pour traçabilité.

## Performance

### Lambda
- Cold start: ~500ms
- Warm execution: <50ms
- Mémoire: 128MB par défaut

### DynamoDB
- Latence: <10ms (single-digit milliseconds)
- Throughput: illimité avec PAY_PER_REQUEST
- GSI pour accès optimisé

### S3
- Presigned URLs évitent passage par Lambda
- Upload/download direct = latence minimale
- Throughput: 3500 PUT/s, 5500 GET/s par préfixe

## Scalabilité

### Horizontal scaling
- Lambda: concurrent executions automatiques
- DynamoDB: auto-scaling du throughput
- S3: scaling automatique illimité

### Vertical scaling
- Lambda memory: ajustable 128MB-10GB
- Pas de serveur à gérer

### Limites
- Lambda concurrent executions: 1000 (soft limit)
- API Gateway: 10000 req/s (soft limit)
- DynamoDB: illimité avec on-demand

## Coûts

### Estimation mensuelle (usage faible)
- Lambda: $0.20 (1M requêtes)
- DynamoDB: $1.25 (25GB stockage + 1M writes)
- S3: $0.50 (20GB stockage + 1M requests)
- API Gateway: $1.00 (1M requests)
- Cognito: gratuit (<50k MAU)

**Total: ~$3/mois**

## Monitoring

### CloudWatch
- Lambda logs automatiques
- Métriques: invocations, duration, errors
- Alarmes configurables

### X-Ray
- Tracing distribué (à activer)
- Analyse performance end-to-end

## Améliorations recommandées

### Court terme
1. CloudFront devant S3 pour CDN
2. Lambda layers pour code partagé
3. DynamoDB Streams pour audit trail
4. EventBridge pour notifications asynchrones

### Moyen terme
1. ElastiCache pour cache requêtes fréquentes
2. OpenSearch pour recherche full-text
3. Step Functions pour workflows complexes
4. WAF pour protection DDoS

### Long terme
1. Multi-region deployment
2. Global Tables (DynamoDB)
3. Route53 pour failover
4. Disaster recovery plan
