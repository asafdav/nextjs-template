'use client';

import React, { useState, useEffect } from 'react';
import { Todo as TodoType } from '@/types/todo';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import * as todoService from '@/services/todoService';

const Todo: React.FC = () => {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos from API on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await todoService.getTodos();
        setTodos(data);
      } catch (err) {
        console.error('Failed to fetch todos:', err);
        setError('Failed to load todos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const addTodo = async (text: string) => {
    try {
      setError(null);
      const newTodo = await todoService.addTodo(text);
      setTodos([...todos, newTodo]);
    } catch (err) {
      console.error('Failed to add todo:', err);
      setError('Failed to add todo. Please try again.');
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      setError(null);
      const todoToUpdate = todos.find(todo => todo.id === id);
      if (!todoToUpdate) return;

      const updatedTodo = await todoService.updateTodo(id, {
        completed: !todoToUpdate.completed,
      });

      setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
    } catch (err) {
      console.error('Failed to update todo:', err);
      setError('Failed to update todo. Please try again.');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      await todoService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('Failed to delete todo. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" role="status" aria-label="Loading">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Todo List
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md" role="alert">
          {error}
        </div>
      )}
      
      <TodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
};

export default Todo;
