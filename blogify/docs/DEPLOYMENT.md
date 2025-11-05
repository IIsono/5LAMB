# Guide de Déploiement - Blogify

## Prérequis

- AWS CLI configuré avec les credentials appropriés
- Terraform >= 1.0
- Node.js >= 20.x
- Droits administrateur sur le compte AWS

## Installation

### 1. Cloner le projet
```bash
git clone <repository>
cd blogify
```

### 2. Installer les dépendances Node.js
```bash
cd lambdas
npm init -y
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
cd ..
```

### 3. Initialiser Terraform
```bash
cd infrastructure
terraform init
```

### 4. Déployer l'infrastructure
```bash
terraform plan
terraform apply
```

### 5. Récupérer les outputs
```bash
terraform output
```

Outputs attendus:
- `api_endpoint`: URL de l'API Gateway
- `user_pool_id`: ID du User Pool Cognito
- `user_pool_client_id`: ID du Client Cognito
- `s3_bucket_name`: Nom du bucket S3

## Configuration Cognito

### Créer un utilisateur test
```bash
aws cognito-idp admin-create-user \
  --user-pool-id <user_pool_id> \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com Name=custom:role,Value=admin \
  --temporary-password TempPassword123! \
  --message-action SUPPRESS
```

### Définir un mot de passe permanent
```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id <user_pool_id> \
  --username test@example.com \
  --password MyPassword123! \
  --permanent
```

## Tests

### Obtenir un token JWT
```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <user_pool_client_id> \
  --auth-parameters USERNAME=test@example.com,PASSWORD=MyPassword123!
```

### Créer un post
```bash
curl -X POST https://<api_endpoint>/posts \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mon premier post",
    "content": "Contenu du post",
    "status": "published",
    "tags": ["test"]
  }'
```

### Lister les posts
```bash
curl https://<api_endpoint>/posts
```

### Uploader un média
```bash
curl -X POST https://<api_endpoint>/media \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.jpg",
    "fileType": "image/jpeg",
    "fileSize": 1024000
  }'
```

Puis uploader le fichier:
```bash
curl -X PUT "<upload_url>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg
```

## Monitoring

### CloudWatch Logs
Les logs Lambda sont automatiquement envoyés vers CloudWatch:
```bash
aws logs tail /aws/lambda/blogify-createPost --follow
```

### Métriques
Accéder aux métriques dans la console AWS:
- Lambda > Functions > Monitoring
- API Gateway > APIs > Monitoring
- DynamoDB > Tables > Monitoring

## Nettoyage

Pour supprimer toutes les ressources:
```bash
cd infrastructure
terraform destroy
```

## Sécurité

- Les buckets S3 bloquent l'accès public par défaut
- Les API utilisent JWT via Cognito
- Les Lambda ont des rôles IAM avec permissions minimales
- CORS est configuré mais doit être restreint en production

## Scalabilité

### DynamoDB
- Mode PAY_PER_REQUEST pour auto-scaling
- GSI pour requêtes optimisées par userId

### Lambda
- Concurrency automatique
- Augmenter la mémoire si nécessaire pour réduire la latence

### S3
- Scalabilité automatique
- Utiliser CloudFront pour la distribution de médias

## Améliorations futures

1. CloudFront devant S3 pour CDN
2. ElastiCache pour mise en cache
3. Lambda@Edge pour personnalisation
4. EventBridge pour notifications
5. OpenSearch pour recherche full-text
6. WAF pour protection API
