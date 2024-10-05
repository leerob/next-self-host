'use client';

export default function ProtectedPage() {
  let safeKey = process.env.NEXT_PUBLIC_SAFE_KEY;

  return (
    <section>
      <h1>This page is protected</h1>
      <p>Safe Key: {safeKey}</p>
    </section>
  );
}
