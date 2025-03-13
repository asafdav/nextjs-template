import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';
import '@testing-library/jest-dom';

// Mock the next/link component
jest.mock('next/link', () => {
  return function MockLink({ children, ...props }: any) {
    return <a {...props}>{children}</a>;
  };
});

describe('Footer Component', () => {
  it('renders the copyright text with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} NextJS Template`))).toBeInTheDocument();
  });

  it('renders the footer links', () => {
    render(<Footer />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });
}); 