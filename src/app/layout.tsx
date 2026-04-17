import type { Metadata } from 'next';
import './globals.css';

/**
 * Root layout for gub-review.
 *
 * Deliberately minimal — this service hosts only public reviewer-facing
 * flows (currently Drive proposal reviews). There's no nav, no admin
 * surface, no authenticated user context. Each page is self-contained and
 * authenticated by a URL token.
 */
export const metadata: Metadata = {
  title: 'GUB Review',
  description: 'Reviewer-facing magic-link flows for the GCP Universal Backend',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
