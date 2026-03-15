#!/bin/bash
# SOS Location - GCP Cloud Run Deployment Automation
set -e

# Configuration - Update these or set via environment variables
PROJECT_ID=$(gcloud config get-value project)
REGION="southamerica-east1" # Sao Paulo
REPOSITORY="sos-location-repo"
BACKEND_NAME="sos-backend"
FRONTEND_NAME="sos-frontend"
ML_UNIT_NAME="sos-ml-risk"

echo "🚀 Starting SOS Location Deployment to GCP Project: $PROJECT_ID"

# 1. Enable Required APIs
echo "📡 Enabling APIs..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com

# 2. Create Artifact Registry if not exists
if ! gcloud artifacts repositories describe $REPOSITORY --location=$REGION &>/dev/null; then
    echo "📦 Creating Artifact Registry..."
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="SOS Location Docker Repository"
fi

# 3. Build and Push Backend
echo "🔨 Building Backend..."
TAG_BACKEND="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$BACKEND_NAME:latest"
docker build -t $TAG_BACKEND ./backend-dotnet
docker push $TAG_BACKEND

# 4. Build and Push ML Unit
echo "🔨 Building ML Risk Unit..."
TAG_ML="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$ML_UNIT_NAME:latest"
docker build -t $TAG_ML ./risk-analysis-unit
docker push $TAG_ML

# 5. Build and Push Frontend
echo "🔨 Building Frontend..."
TAG_FRONTEND="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$FRONTEND_NAME:latest"
# Note: In Cloud Run, the backend URL will be known only after deploy.
# We might need to deploy backend first, then get URL, then build frontend.
docker build -t $TAG_FRONTEND -f ./frontend-react/Dockerfile .
docker push $TAG_FRONTEND

# 6. Deploy Backend
echo "☁️ Deploying Backend to Cloud Run..."
gcloud run deploy $BACKEND_NAME \
    --image $TAG_BACKEND \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars="ASPNETCORE_ENVIRONMENT=Production" \
    --port 8000

# Get the Backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_NAME --region $REGION --format='value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

# 7. Deploy ML Risk Unit
echo "☁️ Deploying ML Risk Unit..."
gcloud run deploy $ML_UNIT_NAME \
    --image $TAG_ML \
    --region $REGION \
    --platform managed \
    --set-env-vars="INTERNAL_API_URL=$BACKEND_URL"

# 8. Deploy Frontend
echo "☁️ Deploying Frontend..."
gcloud run deploy $FRONTEND_NAME \
    --image $TAG_FRONTEND \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8000

echo "🎉 SOS Location Cloud Infrastructure Ready!"
