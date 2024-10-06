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
      <h3>Environment Variables</h3>
      <p>Secret Key: {secretKey}</p>
      <small>
        This value was read from <code>process.env</code>
      </small>
      <h3>Data Fetching</h3>
      <p>Random Pokemon: {pokemon.name}</p>
      <small>
        This value was retrieved with <code>fetch</code> from an API
      </small>
      <h3>Image Optimization</h3>
      <Image
        src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
        width={480}
        height={320}
        alt="Coding"
      />
      <p>
        <small>This remote image was optimized on the Next.js server</small>
      </p>
      <h3>Middleware</h3>
      <p>
        Navigate to <a href="/protected">/protected</a>
      </p>
      <small>
        This route is proteted by a cookie, you will redirect back to /. To view
        the route, add the protected=1 cookie in the browser
      </small>
      <h3>Database</h3>
      <p>
        Navigate to <a href="/db">/protected</a>
      </p>
      <small>
        This route reads and writes to our Postgres database, which is in its
        own Docker container. It uses Drizzle for the ORM. There's also a cron
        job which clears out the database, to reset the demo data.
      </small>
      <h3>Incremental Static Regeneration</h3>
      <p>
        Navigate to <a href="/isr">/protected</a>
      </p>
      <small>
        This route retrieves data with <code>fetch</code> from an API. Then, it
        adds a time-based <code>revalidate</code> time of 10 seconds. This
        indicates it will be "fresh" for a maximum of that time. You can view
        the
        <code>s-maxage=10, stale-while-revalidate=31536000</code> response
        header for the page.
      </small>
    </section>
  );
}
