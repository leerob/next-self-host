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
        includes a Postgres database and an Nginx proxy.{' '}
        <a href="https://github.com/leerob/next-self-host">View the code</a>.
      </p>

      <h3>Data Fetching</h3>
      <p>Random Pokemon: {pokemon.name}</p>
      <p>
        This value was retrieved with <code>fetch</code> from an API. This page
        is served dynamically, fetching a random Pokemon on each request. Reload
        to see a new Pokemon.
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
        <code>next start</code>. The image above is using the default image
        optimization on the Next.js server.
      </p>
      <p>
        In Next.js 15, you no longer need to install <code>sharp</code> manually
        for image optimization, whether local or remote. You can also use a
        custom image loader for external optimization services.
      </p>
      <p>
        You can also bring your own custom image loader, if you would prefer to
        use a different service. You can view an example{' '}
        <a href="https://github.com/leerob/next-self-host/blob/main/image-loader.ts">
          here
        </a>
        , which you can enable through{' '}
        <a href="https://github.com/leerob/next-self-host/blob/main/next.config.ts">
          <code>next.config.ts</code>
        </a>
        .
      </p>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/deploying#image-optimization">
          Read the docs
        </a>
      </p>

      <h3>Streaming</h3>
      <p>
        The Next.js App router supports streaming responses. This demo uses
        <code>Suspense</code> with an <code>async</code> component to stream in
        different components with a delay. We let Nginx handle compression for
        our application, and then disable proxy buffering to enable streamed
        responses.
      </p>
      <p>
        <a href="/streaming">View the demo</a>
      </p>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming">
          Read the docs
        </a>
      </p>

      <h3>Postgres Database</h3>
      <p>
        This route reads and writes to our Postgres database, which is in its
        own Docker container. It uses Drizzle for the ORM. There is also a cron
        job that resets the demo data every 10 minutes. You can manually hit the
        endpoint the cron uses by sending a <code>POST</code> to{' '}
        <a href="https://nextselfhost.dev/db/clear">
          <code>/db/clear</code>
        </a>
      </p>
      <p>
        <a href="/db">View the demo</a>
      </p>

      <h3>Caching / Incremental Static Regeneration</h3>
      <p>
        By default, Next.js ISR uses an <code>lru-cache</code> and stores cached
        entries in memory. This works without configuration, for both caching
        data as well as ISR, in both the Pages and App Router.
      </p>
      <p>
        If you prefer to override the cache location, you can store entries in
        something like Redis. For multi-container applications, this is strongly
        recommended, but for this single container app it’s not necessary.
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
        The default <code>stale-while-revalidate</code> time for static pages
        that do not specify a <code>revalidate</code> time is 1 year, however,
        this can also be{' '}
        <a href="https://nextjs.org/docs/canary/app/api-reference/next-config-js/swrDelta">
          configured
        </a>{' '}
        with <code>swrDelta</code> in <code>next.config.ts</code>.
      </p>
      <p>
        <a href="/isr">View the demo</a>
      </p>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/deploying#caching-and-isr">
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
        Middleware does not have access to all Node.js APIs. It is designed to
        run before all routes in your application. However, we are planning to
        allow support for using the entire Node.js runtime, which can be
        necessary when using some third-party libraries.
      </p>
      <p>
        It is not recommended to do checks like fetching user information from
        your database inside of Middleware. Instead, these checks should happen
        before queries or mutations. Checking for an auth cookie in Middleware
        in the{' '}
        <a href="https://nextjs.org/docs/app/building-your-application/authentication#protecting-routes-with-middleware">
          preferred pattern
        </a>
        .
      </p>
      <p>
        <a href="/protected">View the demo</a>
      </p>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/deploying#middleware">
          Read the docs
        </a>
      </p>

      <h3>Server Startup</h3>
      <p>
        Next.js includes an <code>instrumentation</code> file that runs some
        code when the server starts.
      </p>
      <p>
        This instrumentation file will be stabilized in Next.js 15. A common use
        case is reading secrets from remote locations like Vault or 1Password.
        You can try this by setting the appropriate variables in your{' '}
        <code>.env</code> file for Vault, though it's not required for the demo.
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
        When reading values from a Server Component, you can ensure that the env
        var is read dynamically every time. For container setups, a common use
        case here is to provide different env vars per environment, with the
        same Docker image.
      </p>
      <p>
        This value was read from <code>process.env</code>:{' '}
        <code>{secretKey}</code>
      </p>
      <p>
        <a href="https://nextjs.org/docs/app/building-your-application/deploying#environment-variables">
          Read the docs
        </a>
      </p>
    </section>
  );
}
