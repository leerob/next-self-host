#!/bin/bash

# Env Vars
POSTGRES_USER="myuser"
POSTGRES_PASSWORD=$(openssl rand -base64 12)  # Generate a random 12-character password
POSTGRES_DB="mydatabase"
SECRET_KEY="my-secret" # for the demo app
NEXT_PUBLIC_SAFE_KEY="safe-key" # for the demo app
DOMAIN_NAME="nextselfhost.dev" # replace with your own
EMAIL="your-email@example.com" # replace with your own

# Script Vars
REPO_URL="https://github.com/leerob/next-self-host.git"
APP_DIR=~/myapp
SWAP_SIZE="1G"  # Swap size of 1GB

# Update package list and upgrade existing packages
sudo apt update && sudo apt upgrade -y

# Add Swap Space
echo "Adding swap space..."
sudo fallocate -l $SWAP_SIZE /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Install Docker
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y
sudo apt update && sudo apt install docker-ce -y

# Install Docker Compose
sudo rm -f /usr/local/bin/docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

if [ ! -f /usr/local/bin/docker-compose ]; then
  echo "Docker Compose download failed. Exiting."
  exit 1
fi

sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify Docker Compose installation
docker-compose --version || { echo "Docker Compose installation failed. Exiting."; exit 1; }

# Ensure Docker starts on boot and start Docker service
sudo systemctl enable docker && sudo systemctl start docker

# Clone the Git repository
if [ -d "$APP_DIR" ]; then
  echo "Directory $APP_DIR already exists. Pulling latest changes..."
  cd $APP_DIR && git pull || { echo "Git pull failed. Exiting."; exit 1; }
else
  echo "Cloning repository from $REPO_URL..."
  git clone $REPO_URL $APP_DIR || { echo "Git clone failed. Exiting."; exit 1; }
fi

cd $APP_DIR || { echo "Failed to change directory to $APP_DIR. Exiting."; exit 1; }

# Create .env file with necessary variables...
echo "Creating .env file..."
{
echo "POSTGRES_USER=$POSTGRES_USER"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "POSTGRES_DB=$POSTGRES_DB"
echo "DATABASE_URL=postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@db:5432/$POSTGRES_DB"
echo "DATABASE_URL_EXTERNAL=postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB"
echo "SECRET_KEY=$SECRET_KEY"
echo "NEXT_PUBLIC_SAFE_KEY=$NEXT_PUBLIC_SAFE_KEY"
} > "$APP_DIR/.env"

# Install Nginx and setup configuration...
if ! sudo apt install nginx -y; then
    echo "Nginx installation failed. Exiting."
    exit 1
fi

# Remove old Nginx config (if it exists)
sudo rm -f /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/myapp

# Stop Nginx temporarily to allow Certbot to run in standalone mode
sudo systemctl stop nginx

# Obtain SSL certificate using Certbot standalone mode...
if ! sudo apt install certbot -y; then
    echo "Certbot installation failed. Exiting."
    exit 1
fi

if ! sudo certbot certonly --standalone -d $DOMAIN_NAME --non-interactive --agree-tos -m $EMAIL; then
    echo "Certbot failed to obtain an SSL certificate. Exiting."
    exit 1
fi

# Ensure SSL files exist or generate them...
[ ! -f /etc/letsencrypt/options-ssl-nginx.conf ] && \
    sudo wget https://raw.githubusercontent.com/certbot/certbot/main/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/

[ ! -f /etc/letsencrypt/ssl-dhparams.pem ] && \
    sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048

# Create Nginx config...
sudo cat > /etc/nginx/sites-available/myapp <<EOL
limit_req_zone \$binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    listen 80;
    server_name $DOMAIN_NAME;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN_NAME;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    limit_req zone=mylimit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;
    }
}
EOL

# Create symbolic link if it doesn't already exist...
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/myapp || { echo "Failed to create Nginx symlink. Exiting."; exit 1; }

# Restart Nginx to apply new configuration...
if ! sudo systemctl restart nginx; then
    echo "Failed to restart Nginx. Exiting."
    exit 1
fi

# Build and run the Docker containers...
cd $APP_DIR || { echo "Failed to change directory to $APP_DIR. Exiting."; exit 1; }
if ! sudo docker-compose up --build -d; then
    echo "Docker containers failed to start. Check logs with 'docker-compose logs'."
    exit 1
fi

# Setup automatic SSL certificate renewal...
( crontab -l 2>/dev/null; echo "0 */12 * * * certbot renew --quiet && systemctl reload nginx" ) | crontab -

# Output final message
echo "Deployment complete. Your Next.js app and PostgreSQL database are now running.
Next.js is available at https://$DOMAIN_NAME, and the PostgreSQL database is accessible from the web service.

The .env file has been created with the following values:
- POSTGRES_USER
- POSTGRES_PASSWORD (randomly generated)
- POSTGRES_DB
- DATABASE_URL
- DATABASE_URL_EXTERNAL
- SECRET_KEY
- NEXT_PUBLIC_SAFE_KEY"
