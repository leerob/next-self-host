import { revalidatePath } from 'next/cache';
import { FreshnessTimer } from './timer';

async function revalidateAction() {
  'use server';
  revalidatePath('/isr');
}

async function getPokemon() {
  const randomId = Math.floor(Math.random() * 151) + 1;
  const res = await fetch(`https://api.vercel.app/pokemon/${randomId}`, {
    next: { revalidate: 10 },
  });
  return res.json();
}

export default async function ISRDemo() {
  const pokemon = await getPokemon();
  const generatedAt = Date.now();

  return (
    <div>
      <h1>ISR Demo</h1>
      <p>Pokemon ID: {pokemon.id}</p>
      <p>Name: {pokemon.name}</p>
      <p>Types: {pokemon.type.join(', ')}</p>
      <FreshnessTimer generatedAt={generatedAt} />
      <form action={revalidateAction}>
        <button type="submit">Revalidate</button>
      </form>
    </div>
  );
}
