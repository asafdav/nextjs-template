import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/next.svg"
              alt="NextJS Logo"
              width={100}
              height={24}
              className="dark:invert"
            />
          </Link>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
          >
            Contact
          </Link>
        </nav>
        <div className="md:hidden">
          <button className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
