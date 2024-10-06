import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js Self Hosted Demo',
  description: 'This is hosted on Ubuntu Linux with Nginx as a reverse proxy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
