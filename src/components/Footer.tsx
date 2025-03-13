import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-white dark:bg-gray-900 shadow-inner py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 dark:text-gray-400">
              &copy; {currentYear} NextJS Template. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 