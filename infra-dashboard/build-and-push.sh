#!/bin/bash
set -e

# Usage: ./build-and-push.sh <your-dockerhub-username>
DOCKER_USER=${1}

if [ -z "$DOCKER_USER" ]; then
  echo "Error: Please specify your Docker Hub username."
  echo "Usage: ./build-and-push.sh <dockerhub_username>"
  exit 1
fi

echo "=========================================================="
echo " Building & Pushing all microservices to Docker Hub: $DOCKER_USER"
echo "=========================================================="

echo "--> 1/5 Building history-service..."
docker build -t "$DOCKER_USER/infra-history-service:latest" services/history-service
docker push "$DOCKER_USER/infra-history-service:latest"

echo "--> 2/5 Building alert-service..."
docker build -t "$DOCKER_USER/infra-alert-service:latest" services/alert-service
docker push "$DOCKER_USER/infra-alert-service:latest"

echo "--> 3/5 Building notifier..."
docker build -t "$DOCKER_USER/infra-notifier:latest" services/notifier
docker push "$DOCKER_USER/infra-notifier:latest"

echo "--> 4/5 Building collector-service..."
docker build -t "$DOCKER_USER/infra-collector-service:latest" services/collector-service
docker push "$DOCKER_USER/infra-collector-service:latest"

echo "--> 5/5 Building frontend..."
docker build -t "$DOCKER_USER/infra-frontend:latest" services/frontend
docker push "$DOCKER_USER/infra-frontend:latest"

echo "=========================================================="
echo " All images built and pushed successfully!"
echo " Update cce-k8s/all-in-one.yaml with '$DOCKER_USER' and apply to CCE."
echo "=========================================================="
