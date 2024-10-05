import Image from 'next/image';
import { connection } from 'next/server';

async function getPokemon() {
  await connection();

  let apiKey = global.secrets.apiKey;
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
      <h1>Next.js Self Hosted</h1>
      <p>Secret Key: {secretKey}</p>
      <p>{pokemon.name}</p>
      <Image
        src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
        width={480}
        height={320}
        alt="Coding"
      />
    </section>
  );
}
