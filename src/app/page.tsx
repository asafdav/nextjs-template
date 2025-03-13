import Image from 'next/image';
import Button from '@/components/Button';
import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12">
        <Image
          className="dark:invert mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <h1 className="text-4xl font-bold mb-6 text-center">Welcome to NextJS Template</h1>

        <p className="text-xl mb-8 text-center max-w-2xl">
          A modern NextJS application template with TypeScript, ESLint, Prettier, and Jest
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">TypeScript</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Type-safe JavaScript for better developer experience and fewer bugs.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Testing</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Jest and React Testing Library for comprehensive test coverage.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Tailwind CSS</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Utility-first CSS framework for rapid UI development.
            </p>
          </div>
        </div>

        <Button text="Get Started" />
      </div>
    </Layout>
  );
}
