import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Todo from '@/components/Todo/Todo';
import { Todo as TodoType } from '@/types/todo';
import * as todoService from '@/services/todoService';

// Mock the todoService
jest.mock('@/services/todoService');
const mockTodoService = todoService as jest.Mocked<typeof todoService>;

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock the subcomponents
jest.mock('@/components/Todo/TodoForm', () => {
  return function MockTodoForm({ onAdd }: { onAdd: (text: string) => void }) {
    return (
      <div data-testid="todo-form">
        <input data-testid="mock-todo-input" placeholder="Add a new task..." />
        <button data-testid="mock-add-button" onClick={() => onAdd('New Todo')}>
          Add
        </button>
      </div>
    );
  };
});

jest.mock('@/components/Todo/TodoList', () => {
  return function MockTodoList({
    todos,
    onToggle,
    onDelete,
  }: {
    todos: TodoType[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
  }) {
    return (
      <div data-testid="todo-list">
        {todos.map(todo => (
          <div key={todo.id} data-testid={`todo-item-${todo.id}`}>
            <span>{todo.text}</span>
            <button data-testid={`toggle-${todo.id}`} onClick={() => onToggle(todo.id)}>
              Toggle
            </button>
            <button data-testid={`delete-${todo.id}`} onClick={() => onDelete(todo.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    );
  };
});

describe('Todo Component with API', () => {
  const mockTodos: TodoType[] = [
    {
      id: '1',
      text: 'Test Todo 1',
      completed: false,
      createdAt: new Date(),
    },
    {
      id: '2',
      text: 'Test Todo 2',
      completed: true,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the API responses
    mockTodoService.getTodos.mockResolvedValue(mockTodos);
    mockTodoService.addTodo.mockImplementation(async (text) => ({
      id: '3',
      text,
      completed: false,
      createdAt: new Date(),
    }));
    mockTodoService.updateTodo.mockImplementation(async (id, updates) => ({
      ...mockTodos.find(todo => todo.id === id)!,
      ...updates,
    }));
    mockTodoService.deleteTodo.mockImplementation(async (id) => 
      mockTodos.find(todo => todo.id === id)!
    );
  });

  it('renders loading state initially', async () => {
    // Delay the API response
    mockTodoService.getTodos.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockTodos), 100))
    );

    render(<Todo />);
    
    // Check if loading indicator is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for the loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('fetches and displays todos from the API', async () => {
    render(<Todo />);
    
    // Wait for the todos to be loaded
    await waitFor(() => {
      expect(mockTodoService.getTodos).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
    });
  });

  it('shows error message when API fetch fails', async () => {
    // Mock API error
    mockTodoService.getTodos.mockRejectedValue(new Error('API Error'));
    
    render(<Todo />);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load todos');
    });
  });

  it('adds a new todo via the API', async () => {
    render(<Todo />);
    
    // Wait for the todos to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
    });
    
    // Add a new todo
    const addButton = screen.getByTestId('mock-add-button');
    await act(async () => {
      fireEvent.click(addButton);
    });
    
    // Check if the API was called and the new todo was added
    await waitFor(() => {
      expect(mockTodoService.addTodo).toHaveBeenCalledWith('New Todo');
      expect(screen.getByTestId('todo-item-3')).toBeInTheDocument();
    });
  });

  it('toggles a todo via the API', async () => {
    render(<Todo />);
    
    // Wait for the todos to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
    });
    
    // Toggle a todo
    const toggleButton = screen.getByTestId('toggle-1');
    await act(async () => {
      fireEvent.click(toggleButton);
    });
    
    // Check if the API was called with the correct parameters
    await waitFor(() => {
      expect(mockTodoService.updateTodo).toHaveBeenCalledWith('1', { completed: true });
    });
  });

  it('deletes a todo via the API', async () => {
    render(<Todo />);
    
    // Wait for the todos to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
    });
    
    // Delete a todo
    const deleteButton = screen.getByTestId('delete-1');
    await act(async () => {
      fireEvent.click(deleteButton);
    });
    
    // Check if the API was called with the correct parameters
    await waitFor(() => {
      expect(mockTodoService.deleteTodo).toHaveBeenCalledWith('1');
      expect(screen.queryByTestId('todo-item-1')).not.toBeInTheDocument();
    });
  });

  it('shows error message when adding a todo fails', async () => {
    // Mock API error
    mockTodoService.addTodo.mockRejectedValue(new Error('API Error'));
    
    render(<Todo />);
    
    // Wait for the todos to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
    });
    
    // Try to add a new todo
    const addButton = screen.getByTestId('mock-add-button');
    await act(async () => {
      fireEvent.click(addButton);
    });
    
    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to add todo');
    });
  });
});
