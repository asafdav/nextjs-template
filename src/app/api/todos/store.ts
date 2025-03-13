import { Todo } from '@/types/todo';

// In-memory store for todos (will be replaced with persistence later)
export const store = {
  todos: [] as Todo[],
};

// Helper functions for managing todos
export function getAllTodos(): Todo[] {
  return store.todos;
}

export function getTodoById(id: string): Todo | undefined {
  return store.todos.find(todo => todo.id === id);
}

export function addTodo(text: string): Todo {
  const newTodo: Todo = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: new Date(),
  };
  
  store.todos.push(newTodo);
  return newTodo;
}

export function updateTodo(id: string, updates: Partial<Todo>): Todo | null {
  const index = store.todos.findIndex(todo => todo.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedTodo = {
    ...store.todos[index],
    ...updates,
  };
  
  store.todos[index] = updatedTodo;
  return updatedTodo;
}

export function deleteTodo(id: string): Todo | null {
  const index = store.todos.findIndex(todo => todo.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const deletedTodo = store.todos[index];
  store.todos.splice(index, 1);
  return deletedTodo;
} 