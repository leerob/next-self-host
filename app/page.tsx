import Image from 'next/image';
import { connection } from 'next/server';

async function getPokemon() {
  await connection();

  let apiKey = global.secrets.apiKey || 'None for demo';
  let randomNumber = Math.floor(Math.random() * 100) + 1;

  return await fetch(`https://api.vercel.app/pokemon/${randomNumber}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  }).then((r) => r.json());
}

export default async function Home() {
  let secretKey = process.env.SECRET_KEY;
  let pokemon = await getPokemon();

  return (
    <section>
      <h1>Next.js Self Hosted Demo</h1>
      <p>
        This is a demo of a Next.js application hosted on Ubuntu Linux. It also
        includes a Postgres database and an Nginx proxy.
      </p>

      <h3>Data Fetching</h3>
      <p>Random Pokemon: {pokemon.name}</p>
      <p>
        This value was retrieved with <code>fetch</code> from an API. This page
        is served dynamically, fetching a random Pokemon on each request.
      </p>

      <h3>Image Optimization</h3>
      <Image
        src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
        width={480 / 2}
        height={320 / 2}
        alt="Coding"
      />
      <p>
        Next.js supports image optimization out of the box with{' '}
        <code>next start</code>.
      </p>
      <p>
        In Next.js 15, you no longer need to install <code>sharp</code> manually
        for image optimization, whether local or remote. You can also use a
        custom image loader for external optimization services. The image above
        is using the default image optimization on the Next.js server.
      </p>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/deploying#image-optimization">
          Read the docs
        </a>
      </p>

      <h3>Middleware</h3>
      <p>
        The <code>/protected</code> route is protected by a cookie. You will be
        redirected back to <code>/</code>. To view the route, add the{' '}
        <code>protected=1</code> cookie in the browser.
      </p>
      <p>
        This demo has a protected route, guarded by Middleware, showcasing how
        you can restrict access based on authentication or other criteria.
      </p>
      <p>
        <a href="/protected">View the demo</a>
      </p>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/deploying#middleware">
          Read the docs
        </a>
      </p>

      <h3>Postgres Database</h3>
      <p>
        This route reads and writes to our Postgres database, which is in its
        own Docker container. It uses Drizzle for the ORM. There is also a cron
        job that clears out the database to reset the demo data.
      </p>
      <p>
        <a href="/db">View the demo</a>
      </p>

      <h3>Caching / Incremental Static Regeneration</h3>
      <p>
        By default, Next.js ISR uses an <code>lru-cache</code> and stores cached
        entries in memory. This works without configuration.
      </p>
      <p>
        If you prefer to override the cache location, you can store entries in
        something like Redis. For multi-container applications, this is
        required, but for this demo, it’s not necessary.
      </p>
      <p>
        For this demo, we have a route that retrieves data with{' '}
        <code>fetch</code> from an API, then adds a time-based{' '}
        <code>revalidate</code> time of 10 seconds. This indicates it will be
        "fresh" for a maximum of that time. You can view the{' '}
        <code>s-maxage=10, stale-while-revalidate=31536000</code> response
        header for the page.
      </p>
      <p>
        <a href="/isr">View the demo</a>
      </p>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/deploying#caching-and-isr">
          Read the docs
        </a>
      </p>

      <h3>Server Startup</h3>
      <p>
        Next.js includes an <code>instrumentation</code> file that runs some
        code when the server starts.
      </p>
      <p>
        This will be stabilized in Next.js 15. A common use case is reading
        secrets from remote locations like Vault or 1Password. You can try this
        by setting the appropriate variables in your <code>.env</code> file,
        though it's not required for the demo.
      </p>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation">
          Read the docs
        </a>
      </p>

      <h3>Environment Variables</h3>
      <p>
        Next.js supports loading environment variables from <code>.env</code>{' '}
        files.
      </p>
      <p>
        Secret values should only be accessed from Server Components, as
        demonstrated below. This value was read from <code>process.env</code>.
      </p>
      <p>Secret Key: {secretKey}</p>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/deploying#environment-variables">
          Read the docs
        </a>
      </p>
    </section>
  );
}
