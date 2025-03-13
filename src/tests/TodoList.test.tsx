import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from '@/components/Todo/TodoList';
import { Todo } from '@/types/todo';

// Mock the TodoItem component
jest.mock('@/components/Todo/TodoItem', () => {
  return function MockTodoItem({ todo }: { todo: Todo }) {
    return <li data-testid={`todo-item-${todo.id}`}>{todo.text}</li>;
  };
});

describe('TodoList Component', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      text: 'Test Todo 1',
      completed: false,
      createdAt: new Date()
    },
    {
      id: '2',
      text: 'Test Todo 2',
      completed: true,
      createdAt: new Date()
    }
  ];

  const mockToggle = jest.fn();
  const mockDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a message when there are no todos', () => {
    render(<TodoList todos={[]} onToggle={mockToggle} onDelete={mockDelete} />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('renders all todo items when there are todos', () => {
    render(<TodoList todos={mockTodos} onToggle={mockToggle} onDelete={mockDelete} />);
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });
}); 