import { Suspense } from 'react';

// Soon, Next.js will automatically see this is dynamic
// from the Promise, so we won't need to config!
export const dynamic = 'force-dynamic';

async function fetchData(id: number) {
  await new Promise((resolve) => setTimeout(resolve, id * 1000));
  return `Data loaded after ${id} second${id > 1 ? 's' : ''}`;
}

async function AsyncDataComponent({ id }: { id: number }) {
  const data = await fetchData(id);
  return (
    <div>
      <h2>Content {id}</h2>
      <p>{data}</p>
    </div>
  );
}

function LoadingCard({ id }: { id: number }) {
  return (
    <div>
      <h2>Content {id}</h2>
      <p>Loading...</p>
    </div>
  );
}

export default function Streaming() {
  return (
    <div>
      <h1>Streaming Demo with Server Components</h1>

      <Suspense fallback={<LoadingCard id={1} />}>
        <AsyncDataComponent id={1} />
        <Suspense fallback={<LoadingCard id={2} />}>
          <AsyncDataComponent id={2} />
          <Suspense fallback={<LoadingCard id={3} />}>
            <AsyncDataComponent id={3} />
            <Suspense fallback={<LoadingCard id={4} />}>
              <AsyncDataComponent id={4} />
              <Suspense fallback={<LoadingCard id={5} />}>
                <AsyncDataComponent id={5} />
              </Suspense>
            </Suspense>
          </Suspense>
        </Suspense>
      </Suspense>
    </div>
  );
}
