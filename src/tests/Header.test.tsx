import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';
import '@testing-library/jest-dom';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock the next/link component
jest.mock('next/link', () => {
  return function MockLink({
    children,
    ...props
  }: React.ComponentProps<'a'> & { children: React.ReactNode }) {
    return <a {...props}>{children}</a>;
  };
});

describe('Header Component', () => {
  it('renders the logo', () => {
    render(<Header />);
    const logo = screen.getByAltText('NextJS Logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders the mobile menu button on small screens', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });
});
