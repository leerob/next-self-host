# Next.js Self Hosting Example

This repo shows how to deploy a Next.js app and a PostgreSQL database on a Ubuntu Linux server using Docker and Nginx. It showcases using several features of Next.js like caching, ISR, environment variables, and more.

> [!WARNING]  
> This repo is still under development.

## Prerequisites

1. Purchase a domain name
2. Purchase a Linux Ubuntu server (e.g. [droplet](https://www.digitalocean.com/products/droplets))
3. Create an `A` DNS record pointing to your server IPv4 address

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

## Deploy Script

I've included a Bash script which does the following:

1. Installs all the necessary packages for your server
1. Installs Docker, Docker Compose, and Nginx
1. Clones this repository
1. Generates an SSL certificate
1. Builds your Next.js application from the Dockerfile
1. Sets up Nginx as a reverse proxy and configures HTTPS
1. Sets up a cron which clears the database every hour
1. Creates a `.env` file with your Postgres database creds

Once the deployment completes, your Next.js app will be available at:

```
http://your-provided-domain.com
```

Both the Next.js app and PostgreSQL database will be up and running in Docker containers. To set up your database, you could install `npm` inside your Postgres container and use the Drizzle scripts, or you can use `psql`:

```bash
docker exec -it myapp-db-1 sh
apk add --no-cache postgresql-client
psql -U myuser -d mydatabase -c '
CREATE TABLE IF NOT EXISTS "todos" (
  "id" serial PRIMARY KEY NOT NULL,
  "content" varchar(255) NOT NULL,
  "completed" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now()
);'
```

For pushing subsequent updates, I also provided an `update.sh` script as an example.

## Supported Features

This demo tries to showcase many different Next.js features.

### Caching / Incremental Static Regeneration

By default, Next.js ISR uses an `lru-cache` and stores cached entries in memory. This works without configuration.

If you would prefer to override the location of the cache, you can optionally store these entries to storage like Redis. If you are deploying a multi-container application, you will need to use this. For this demo, it's not required.

To see a demo on time-based invalidation and on-demand invalidation, go to `/isr`.

[**→ Read the docs**](https://nextjs.org/docs/app/building-your-application/deploying#caching-and-isr)

### Environment Variables

Next.js supports loading environment variables from `.env` files.

Env vars prefixed with `NEXT_PUBLIC_` will be bundled and sent to the browser. `app/protected/page.tsx` shows an example of this. You can look at the source document to verify it has been bundled. This only makes sense for values you're comfortable being exposed to the browser.

If you want a secret env value to remain server only, you should only access it from a Server Component. `app/page.tsx` shows an example of this.

[**→ Read the docs**](https://nextjs.org/docs/app/building-your-application/deploying#environment-variables)

## Server Startup

Next.js includes an `instrumentation` file which can run some code when the server starts.

This value will be stabilized in Next.js 15 (which this repo is using) – the documentation currently shows it under an experimental object in `next.config.js`.

A common use case for this is reading secrets from a remote location, like Vault or 1Password. I've included an example with Vault, if you provide the necessary env vars to your `.env` file. This is not required, though.

```bash
HCP_API_KEY=
HCP_ORG=
HCP_PROJECT=
```

[**→ Read the docs**](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)

### Image Optimization

Next.js supports optimizing images out of the box with `next start`. We've made some improvements in Next.js 15 so you don't need to manually install `sharp` to optimize images. This means your Next.js server will use `sharp` and can optimize both local or remote images.

I've included a custom image loader, which will allow you to move optimization to a separate self-hosted service or cloud API if you prefer. You can uncomment that in the configuration and then modify `image-loader.ts` with your service.

[**→ Read the docs**](https://nextjs.org/docs/app/building-your-application/deploying#image-optimization)

### Middleware

This demo has a route `/protected` which is guarded by Middleware.

[**→ Read the docs**](https://nextjs.org/docs/app/building-your-application/deploying#middleware)

## Running Locally

If you want to run this setup locally using Docker, you can follow these steps:

```bash
docker-compose up
```

This will start both services and make your Next.js app available at `http://localhost:3000` with the PostgreSQL database running in the background. We also create a network so that our two containers can communicate with each other.

If you want to view the contents of the database, you can use Drizzle Studio:

```bash
bun run db:studio
```

## Cron

I've also included a basic cron job which runs every hour to clear the database. It calls a Route Handler in the Next.js application.

You can view the cron logs as follows:

```bash
docker-compose logs cron
```

## Helpful Commands

- `docker-compose ps` – check status of Docker containers
- `docker-compose logs web` – view Next.js output logs
- `docker-compose down` - shut down the Docker containers
- `docker-compose up -d` - start containers in the background
- `sudo systemctl restart nginx` - restart nginx
