import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Todo from '@/components/Todo/Todo';
import { Todo as TodoType } from '@/types/todo';
import * as todoService from '@/services/todoService';
import { localStorageService } from '@/utils/localStorage';

// Mock the todoService
jest.mock('@/services/todoService');
const mockTodoService = todoService as jest.Mocked<typeof todoService>;

// Mock the localStorage service
jest.mock('@/utils/localStorage', () => ({
  localStorageService: {
    subscribeToUpdates: jest.fn().mockReturnValue(() => {}),
  },
}));

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

// Mock the child components
jest.mock('@/components/Todo/TodoForm', () => {
  return function MockTodoForm({ onAdd }: { onAdd: (text: string) => void }) {
    return (
      <div data-testid="todo-form">
        <input 
          data-testid="mock-todo-input" 
          placeholder="Add a new task..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAdd('New Todo');
            }
          }}
        />
        <button 
          data-testid="mock-add-button"
          onClick={() => onAdd('New Todo')}
        >
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
    onDelete 
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
            <button 
              data-testid={`toggle-${todo.id}`}
              onClick={() => onToggle(todo.id)}
            >
              Toggle
            </button>
            <button 
              data-testid={`delete-${todo.id}`}
              onClick={() => onDelete(todo.id)}
            >
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
      createdAt: new Date('2025-01-01T12:00:00Z'),
    },
    {
      id: '2',
      text: 'Test Todo 2',
      completed: true,
      createdAt: new Date('2025-01-02T12:00:00Z'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the todoService methods
    (todoService.getTodos as jest.Mock).mockResolvedValue(mockTodos);
    (todoService.addTodo as jest.Mock).mockResolvedValue(mockTodos[0]);
    (todoService.updateTodo as jest.Mock).mockResolvedValue({
      ...mockTodos[0],
      completed: !mockTodos[0].completed,
    });
    (todoService.deleteTodo as jest.Mock).mockResolvedValue(mockTodos[0]);
    (todoService.clearAllTodos as jest.Mock).mockResolvedValue({ message: 'All todos cleared' });
  });

  it('renders loading state initially', async () => {
    // Delay the API response to show loading state
    (todoService.getTodos as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockTodos), 100))
    );

    render(<Todo />);
    
    // Should show loading spinner initially
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Wait for the todos to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('fetches and displays todos from the API', async () => {
    render(<Todo />);
    
    // Wait for the todos to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    // Should display the todos
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    
    // Should have called the API
    expect(todoService.getTodos).toHaveBeenCalled();
  });

  it('shows error message when API fetch fails', async () => {
    // Mock API failure
    (todoService.getTodos as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<Todo />);
    
    // Wait for the error message
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    // Should display error message
    expect(screen.getByText(/Failed to load todos/i)).toBeInTheDocument();
  });

  it('adds a new todo via the API', async () => {
    render(<Todo />);
    
    // Wait for the todos to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    // Add a new todo
    const addButton = screen.getByTestId('mock-add-button');
    fireEvent.click(addButton);
    
    // Should call the API
    expect(todoService.addTodo).toHaveBeenCalledWith('New Todo');
  });

  it('toggles a todo via the API', async () => {
    render(<Todo />);
    
    // Wait for the todos to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    // Toggle the first todo
    const toggleButton = screen.getByTestId('toggle-1');
    fireEvent.click(toggleButton);
    
    // Should call the API
    expect(todoService.updateTodo).toHaveBeenCalledWith('1', { completed: true });
  });

  it('deletes a todo via the API', async () => {
    render(<Todo />);
    
    // Wait for the todos to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    // Delete the first todo
    const deleteButton = screen.getByTestId('delete-1');
    fireEvent.click(deleteButton);
    
    // Should call the API
    expect(todoService.deleteTodo).toHaveBeenCalledWith('1');
  });

  it('shows error message when adding a todo fails', async () => {
    // Mock API failure
    (todoService.addTodo as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<Todo />);
    
    // Wait for the todos to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    // Add a new todo
    const addButton = screen.getByTestId('mock-add-button');
    fireEvent.click(addButton);
    
    // Should call the API
    expect(todoService.addTodo).toHaveBeenCalledWith('New Todo');
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to add todo/i)).toBeInTheDocument();
    });
  });

  it('clears all todos when the clear button is clicked', async () => {
    render(<Todo />);
    
    // Wait for the todos to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    // Click the clear all button
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    // Should call the API
    expect(todoService.clearAllTodos).toHaveBeenCalled();
  });

  it('subscribes to localStorage updates', async () => {
    render(<Todo />);
    
    // Wait for the todos to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    // Should have subscribed to localStorage updates
    expect(localStorageService.subscribeToUpdates).toHaveBeenCalled();
  });
});
