import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Todo from '@/components/Todo/Todo';
import { Todo as TodoType } from '@/types/todo';

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
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock the subcomponents
jest.mock('@/components/Todo/TodoForm', () => {
  return function MockTodoForm({ onAdd }: { onAdd: (text: string) => void }) {
    return (
      <div data-testid="todo-form">
        <input
          data-testid="mock-todo-input"
          onChange={(e) => {}}
          placeholder="Add a new task..."
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
        {todos.map((todo) => (
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

describe('Todo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('renders the TodoForm and TodoList components', () => {
    render(<Todo />);
    expect(screen.getByTestId('todo-form')).toBeInTheDocument();
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
  });

  it('adds a new todo when TodoForm calls onAdd', () => {
    render(<Todo />);
    const addButton = screen.getByTestId('mock-add-button');
    
    act(() => {
      fireEvent.click(addButton);
    });
    
    // Check if the todo was added to the list
    expect(screen.getByTestId(/todo-item-/)).toBeInTheDocument();
    expect(screen.getByText('New Todo')).toBeInTheDocument();
  });

  it('toggles a todo when TodoList calls onToggle', async () => {
    // Setup initial state with a todo
    mockLocalStorage.setItem('todos', JSON.stringify([
      {
        id: '1',
        text: 'Test Todo',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ]));
    
    render(<Todo />);
    
    // Find and click the toggle button
    const toggleButton = screen.getByTestId('toggle-1');
    
    act(() => {
      fireEvent.click(toggleButton);
    });
    
    // Check if localStorage was updated with the toggled todo
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const lastCall = mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1];
    const savedTodos = JSON.parse(lastCall[1]);
    expect(savedTodos[0].completed).toBe(true);
  });

  it('deletes a todo when TodoList calls onDelete', () => {
    // Setup initial state with a todo
    mockLocalStorage.setItem('todos', JSON.stringify([
      {
        id: '1',
        text: 'Test Todo',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ]));
    
    render(<Todo />);
    
    // Find and click the delete button
    const deleteButton = screen.getByTestId('delete-1');
    
    act(() => {
      fireEvent.click(deleteButton);
    });
    
    // Check if the todo was removed from the list
    expect(screen.queryByTestId('todo-item-1')).not.toBeInTheDocument();
    
    // Check if localStorage was updated without the deleted todo
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const lastCall = mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1];
    const savedTodos = JSON.parse(lastCall[1]);
    expect(savedTodos.length).toBe(0);
  });

  it('loads todos from localStorage on mount', () => {
    // Setup localStorage with some todos
    const mockTodos = [
      {
        id: '1',
        text: 'Test Todo 1',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        text: 'Test Todo 2',
        completed: true,
        createdAt: new Date().toISOString()
      }
    ];
    mockLocalStorage.setItem('todos', JSON.stringify(mockTodos));
    
    render(<Todo />);
    
    // Check if todos were loaded from localStorage
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });
}); 