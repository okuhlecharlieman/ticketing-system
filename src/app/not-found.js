import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
          Page Not Found
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}