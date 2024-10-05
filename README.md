# Next.js Self Hosting Example

This repository demonstrates how to deploy a Next.js app and a PostgreSQL database on a Linux Ubuntu server using Docker and Nginx. It showcases several key features of Next.js like caching, ISR, environment variables, and more.

## Deployment Instructions

1. **SSH into your server**:

   ```bash
   ssh root@your_server_ip
   ```

2. **Download and run the deployment script**:

   ```bash
   curl -o ~/deploy.sh https://raw.githubusercontent.com/leerob/next-self-hosted/main/deploy.sh
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

You can configure the PostgreSQL database credentials using an `.env` file. Add the following to your `.env` file in the root of the repository:

#### Example `.env` file:

```bash
POSTGRES_USERNAME=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DATABASE=mydatabase
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
