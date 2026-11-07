#!/usr/bin/env bash

set -euo pipefail

PROJECT_NAME="${1:?Usage: $0 <project-name>}"
REGION="us-east-1"

aws ssm put-parameter \
  --region "$REGION" \
  --name "/${PROJECT_NAME}/production/backend/env" \
  --type "SecureString" \
  --value "$(cat ../../backend/.env)" \
  --overwrite

aws ssm put-parameter \
  --region "$REGION" \
  --name "/${PROJECT_NAME}/production/frontend/env" \
  --type "SecureString" \
  --value "$(cat ../../frontend/.env)" \
  --overwrite

aws ssm put-parameter \
  --region "$REGION" \
  --name "/${PROJECT_NAME}/production/backend/firebase-service-account" \
  --type "SecureString" \
  --value "$(cat ../../backend/firebase-service-account.json)" \
  --overwrite

echo "Parameters populated for project: $PROJECT_NAME"