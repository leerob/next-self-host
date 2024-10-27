#!/bin/bash

# Script Vars
REPO_URL="https://github.com/leerob/next-self-host.git"
APP_DIR=~/myapp

# Pull the latest changes from the Git repository
if [ -d "$APP_DIR" ]; then
  echo "Pulling latest changes from the repository..."
  cd $APP_DIR
  git pull origin main
else
  echo "Cloning repository from $REPO_URL..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# Build the new image
echo "Building new Docker image..."
sudo docker-compose build

# Check if the build was successful
if [ $? -ne 0 ]; then
  echo "Docker build failed. Aborting deployment."
  exit 1
fi

# Start the new containers without stopping the old ones
echo "Starting new containers..."
sudo docker-compose up -d --no-deps --scale web=2 --no-recreate

# Wait for the new container to be healthy (adjust the health check as needed)
echo "Waiting for new container to be ready..."
sleep 10  # Adjust this value based on your application's startup time

# Stop and remove the old container
echo "Stopping old container..."
OLD_CONTAINER=$(sudo docker-compose ps -q web | head -n 1)
sudo docker stop $OLD_CONTAINER
sudo docker rm $OLD_CONTAINER

# Scale back to one instance
sudo docker-compose up -d --no-deps --scale web=1 --no-recreate

# Check if Docker Compose started correctly
if ! sudo docker-compose ps | grep "Up"; then
  echo "Docker containers failed to start. Check logs with 'docker-compose logs'."
  exit 1
fi

# Output final message
echo "Update complete. Your Next.js app has been deployed with the latest changes."

