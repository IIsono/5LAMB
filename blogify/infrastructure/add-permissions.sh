#!/bin/bash

# Script pour ajouter les permissions nécessaires à l'utilisateur Prestashop_demo
# À exécuter avec un compte AWS ayant les droits admin

# Créer la policy
aws iam create-policy \
  --policy-name BlogifyTerraformPolicy \
  --policy-document file://terraform-permissions-policy.json \
  --description "Permissions pour déployer Blogify avec Terraform"

# Récupérer l'ARN de la policy (à adapter avec votre account ID)
POLICY_ARN="arn:aws:iam::913826031566:policy/BlogifyTerraformPolicy"

# Attacher la policy à l'utilisateur
aws iam attach-user-policy \
  --user-name Prestashop_demo \
  --policy-arn $POLICY_ARN

echo "Permissions ajoutées avec succès!"
