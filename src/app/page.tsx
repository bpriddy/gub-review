/**
 * Root landing page — intentionally a dead-end.
 *
 * gub-review exists to serve specific tokenized flows (e.g. Drive proposal
 * reviews). If someone lands on the root without a valid token path, they
 * get a small blank page rather than any navigable surface.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-lg font-semibold text-gray-900">GUB Review</h1>
        <p className="text-sm text-gray-500 mt-2">
          This page has no public content. Review links are sent by email.
        </p>
      </div>
    </div>
  );
}
