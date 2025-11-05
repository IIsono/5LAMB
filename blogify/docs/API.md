# Blogify API Documentation

## Base URL
`https://{api-id}.execute-api.{region}.amazonaws.com`

## Authentication
Toutes les routes nécessitant une authentification requièrent un header:
```
Authorization: Bearer {JWT_TOKEN}
```

## Endpoints

### Posts

#### POST /posts
Créer un nouveau post.

**Auth**: Requise

**Body**:
```json
{
  "title": "Mon titre",
  "content": "Contenu du post",
  "status": "draft",
  "tags": ["tech", "aws"]
}
```

**Response** (201):
```json
{
  "postId": "uuid",
  "userId": "uuid",
  "title": "Mon titre",
  "content": "Contenu du post",
  "status": "draft",
  "tags": ["tech", "aws"],
  "mediaUrls": [],
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "publishedAt": null
}
```

#### GET /posts/{postId}
Récupérer un post spécifique.

**Auth**: Non requise

**Query Params**:
- `createdAt` (required): Timestamp de création

**Response** (200):
```json
{
  "postId": "uuid",
  "userId": "uuid",
  "title": "Mon titre",
  "content": "Contenu du post",
  "status": "published",
  "tags": ["tech", "aws"],
  "mediaUrls": [],
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "publishedAt": 1234567890
}
```

#### GET /posts
Lister les posts.

**Auth**: Non requise

**Query Params**:
- `userId` (optional): Filtrer par utilisateur
- `limit` (optional, default: 20): Nombre de résultats

**Response** (200):
```json
{
  "items": [
    {
      "postId": "uuid",
      "title": "Mon titre",
      "status": "published",
      "createdAt": 1234567890
    }
  ],
  "count": 1
}
```

#### PUT /posts/{postId}
Mettre à jour un post.

**Auth**: Requise

**Query Params**:
- `createdAt` (required): Timestamp de création

**Body**:
```json
{
  "title": "Nouveau titre",
  "content": "Nouveau contenu",
  "status": "published",
  "tags": ["updated"],
  "mediaUrls": ["media-id-1"]
}
```

**Response** (200):
```json
{
  "postId": "uuid",
  "userId": "uuid",
  "title": "Nouveau titre",
  "content": "Nouveau contenu",
  "status": "published",
  "tags": ["updated"],
  "mediaUrls": ["media-id-1"],
  "createdAt": 1234567890,
  "updatedAt": 1234567891,
  "publishedAt": 1234567891
}
```

#### DELETE /posts/{postId}
Supprimer un post.

**Auth**: Requise

**Query Params**:
- `createdAt` (required): Timestamp de création

**Response** (204): No content

### Media

#### POST /media
Obtenir une URL de téléchargement signée.

**Auth**: Requise

**Body**:
```json
{
  "fileName": "image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1024000
}
```

**Response** (200):
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "mediaId": "uuid",
  "s3Key": "userId/mediaId/image.jpg"
}
```

**Usage**: Utiliser `uploadUrl` pour un PUT request avec le fichier.

#### GET /media/{mediaId}
Récupérer les informations d'un média et obtenir une URL de téléchargement.

**Auth**: Non requise

**Response** (200):
```json
{
  "mediaId": "uuid",
  "userId": "uuid",
  "s3Key": "userId/mediaId/image.jpg",
  "s3Bucket": "blogify-media-dev",
  "fileType": "image/jpeg",
  "fileSize": 1024000,
  "uploadedAt": 1234567890,
  "downloadUrl": "https://s3.amazonaws.com/..."
}
```

### Comments

#### POST /posts/{postId}/comments
Créer un commentaire sur un post.

**Auth**: Non requise

**Body**:
```json
{
  "content": "Super article !",
  "authorName": "Jean Dupont",
  "authorEmail": "jean@example.com"
}
```

**Response** (201):
```json
{
  "commentId": "uuid",
  "postId": "uuid",
  "userId": "anonymous",
  "content": "Super article !",
  "authorName": "Jean Dupont",
  "authorEmail": "jean@example.com",
  "status": "pending",
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

#### GET /posts/{postId}/comments
Lister les commentaires d'un post.

**Auth**: Non requise

**Query Params**:
- `status` (optional, default: approved): pending, approved, rejected
- `limit` (optional, default: 50): Nombre de résultats

**Response** (200):
```json
{
  "items": [
    {
      "commentId": "uuid",
      "postId": "uuid",
      "content": "Super article !",
      "authorName": "Jean Dupont",
      "status": "approved",
      "createdAt": 1234567890
    }
  ],
  "count": 1
}
```

#### PUT /comments/{commentId}/moderate
Modérer un commentaire (admin/editor uniquement).

**Auth**: Requise (admin ou editor)

**Body**:
```json
{
  "status": "approved"
}
```

**Response** (200):
```json
{
  "commentId": "uuid",
  "postId": "uuid",
  "content": "Super article !",
  "status": "approved",
  "updatedAt": 1234567891
}
```

### Search

#### GET /posts/search
Rechercher des posts par mot-clé ou tags.

**Auth**: Non requise

**Query Params**:
- `q` (optional): Mot-clé de recherche
- `tags` (optional): Tags séparés par virgules
- `status` (optional, default: published): draft, published, archived
- `limit` (optional, default: 20): Nombre de résultats

**Response** (200):
```json
{
  "items": [
    {
      "postId": "uuid",
      "title": "Résultat de recherche",
      "content": "Contenu contenant le mot-clé...",
      "tags": ["tech"],
      "createdAt": 1234567890
    }
  ],
  "count": 1,
  "query": "mot-clé",
  "tags": "tech,aws"
}
```

### Subscriptions

#### POST /subscriptions/{action}
S'abonner ou se désabonner aux notifications.

**Auth**: Non requise

**Actions**: subscribe, unsubscribe

**Body (subscribe)**:
```json
{
  "email": "user@example.com"
}
```

**Body (unsubscribe)**:
```json
{
  "email": "user@example.com",
  "subscriptionId": "uuid"
}
```

**Response** (201 pour subscribe, 200 pour unsubscribe):
```json
{
  "message": "Successfully subscribed",
  "subscriptionId": "uuid"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Title and content are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "message": "Post not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Status Codes
- `draft`: Brouillon
- `published`: Publié
- `archived`: Archivé
