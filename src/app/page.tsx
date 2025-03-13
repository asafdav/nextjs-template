import Image from 'next/image';
import Layout from '@/components/Layout';
import Todo from '@/components/Todo';

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

        <div className="w-full max-w-4xl mb-12">
          <Todo />
        </div>
      </div>
    </Layout>
  );
}
