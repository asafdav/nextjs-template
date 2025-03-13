import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '@/components/Layout';
import '@testing-library/jest-dom';

// Mock the Header component
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header Component</div>;
  };
});

// Mock the Footer component
jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="mock-footer">Footer Component</div>;
  };
});

describe('Layout Component', () => {
  it('renders the header and footer', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  it('renders the children content', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
}); 