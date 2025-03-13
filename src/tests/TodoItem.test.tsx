import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoItem from '@/components/Todo/TodoItem';
import { Todo } from '@/types/todo';

describe('TodoItem Component', () => {
  const mockTodo: Todo = {
    id: '1',
    text: 'Test Todo',
    completed: false,
    createdAt: new Date()
  };

  const mockToggle = jest.fn();
  const mockDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the todo text correctly', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockToggle} onDelete={mockDelete} />);
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockToggle} onDelete={mockDelete} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockToggle).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockToggle} onDelete={mockDelete} />);
    const deleteButton = screen.getByRole('button', { name: /delete "Test Todo"/i });
    fireEvent.click(deleteButton);
    expect(mockDelete).toHaveBeenCalledWith('1');
  });

  it('applies line-through style when todo is completed', () => {
    const completedTodo: Todo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} onToggle={mockToggle} onDelete={mockDelete} />);
    const todoText = screen.getByText('Test Todo');
    expect(todoText).toHaveClass('line-through');
  });
}); 