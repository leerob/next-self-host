# Next.js Self Hosting Example

This repo shows how to deploy a Next.js app and a PostgreSQL database on a Linux Ubuntu server using Docker and Nginx. It showcases several key features of Next.js like caching, ISR, environment variables, and more.

> [!WARNING]  
> This repo is still under development.

## Deployment Instructions

1. **SSH into your server**:

   ```bash
   ssh root@your_server_ip
   ```

2. **Download and run the deployment script**:

   ```bash
   curl -o ~/deploy.sh https://raw.githubusercontent.com/leerob/next-self-host/main/deploy.sh
   chmod +x ~/deploy.sh
   ./deploy.sh
   ```

### What the Script Does

1. **Installs Docker and Docker Compose**: Ensures your droplet has the necessary tools to run containerized applications.

2. **Clones this Repository**: Pulls the latest version of your Next.js app and the related configuration files.

3. **Builds and Deploys Your App**: Uses the `Dockerfile` to build the Next.js app and runs it in a Docker container. PostgreSQL is also set up using Docker Compose.

4. **Sets up Nginx as a Reverse Proxy**: Configures Nginx to proxy HTTP traffic to the Next.js app.

5. **Supports Streaming**: Nginx is configured with `X-Accel-Buffering` set to `no` to support streaming responses, such as real-time data or server-sent events.

### Features Supported in This Demo

1. **Configuring Caching and Incremental Static Regeneration (ISR)**:

   - Next.js uses [automatic caching](https://nextjs.org/docs/app/building-your-application/deploying#caching-and-isr) with ISR to cache pages and revalidate them in the background based on the `getStaticProps` function.
   - You can configure the cache location for persistent storage across containers in the Next.js app.

2. **Reading Environment Variables on Server Startup**:

   - Next.js supports reading both build-time and runtime environment variables. Server-side environment variables can be accessed using `process.env` in [getServerSideProps or App Router](https://nextjs.org/docs/app/building-your-application/deploying#environment-variables).

3. **Configuring next/image to Use a Custom Loader**:

   - The Next.js `next/image` component is fully supported in self-hosted environments. You can use a [custom image loader](https://nextjs.org/docs/app/building-your-application/deploying#image-optimization) if needed for optimizing images on your preferred service.

4. **Using Middleware to Protect Routes**:

   - This demo allows you to set up [Middleware](https://nextjs.org/docs/app/building-your-application/deploying#middleware) to protect specific routes. Middleware can execute logic, such as authentication, before routing requests.

5. **Reading Both Server-Only and Client-Accessible Environment Variables**:
   - [Server-only variables](https://nextjs.org/docs/app/building-your-application/deploying#environment-variables) can be accessed via `process.env`, and client-accessible environment variables (prefixed with `NEXT_PUBLIC_`) are injected into the frontend JavaScript bundle.

### Configuration Files

- [**Nginx Configuration**](https://github.com/leerob/next-self-hosted/blob/main/nginx.conf): Nginx configuration file that forwards traffic to the Next.js app and disables buffering for streaming support.
- [**Dockerfile**](https://github.com/leerob/next-self-hosted/blob/main/Dockerfile): Dockerfile that sets up the build process for the Next.js app using Bun.

- [**Docker Compose**](https://github.com/leerob/next-self-hosted/blob/main/docker-compose.yml): Docker Compose file that configures and runs both the Next.js app and PostgreSQL database.

### Environment Variables

The deploy script creates a `.env` file for you similar to:

```bash
DATABASE_URL=
SECRET_KEY=
NEXT_PUBLIC_SAFE_KEY=
```

### Accessing Your App

Once the deployment completes, your Next.js app will be available at:

```
http://your_server_ip
```

Both the Next.js app and PostgreSQL database will be up and running in Docker containers.

### Running Locally

If you want to run this setup locally using Docker, you can follow these steps:

1. **Build the Docker Image**:

   ```bash
   docker build -t nextjs-docker .
   ```

2. **Run the Docker Container**:

   ```bash
   docker run -p 3000:3000 nextjs-docker
   ```

   This will make your Next.js app accessible at `http://localhost:3000`.

3. **Using Docker Compose**:

   You can also use Docker Compose to run both the Next.js app and PostgreSQL:

   ```bash
   docker-compose up
   ```

   This command will start both services and make your Next.js app available at `http://localhost:3000` with the PostgreSQL database running in the background.

## Troubleshooting

If you encounter issues like "Internal Server Error" or Nginx returning a 502 Bad Gateway, follow these steps to troubleshoot:

1. **Check Nginx Logs**:

   - Nginx handles reverse proxying, and if it can't reach the application, it will log the issue. You can tail the Nginx logs to see any errors:
     ```bash
     sudo tail -f /var/log/nginx/error.log
     ```
   - Look for `connect() failed (111: Connection refused)` or similar errors, which suggest that Nginx is unable to reach the application.

2. **Check Docker Logs**:

   - If Nginx is unable to connect to the application, verify if the application container is running correctly.
   - First, check the status of the Docker containers:
     ```bash
     docker-compose ps
     ```
   - If the web container isn’t running, check the logs to see why it failed:
     ```bash
     docker-compose logs web
     ```

3. **Restart Containers and Nginx**:

   - If the containers or Nginx are not behaving as expected, restart them:
     - Restart Docker containers:
       ```bash
       docker-compose down
       docker-compose up -d
       ```
     - Restart Nginx:
       ```bash
       sudo systemctl restart nginx
       ```

4. **Check Application Environment Variables**:
   - Ensure the `.env` file is correctly set up with the right database credentials and environment variables. If any variables are missing or incorrect, the app might not start properly.
   - You can update the `.env` file located in the app directory and then rebuild the Docker containers.
