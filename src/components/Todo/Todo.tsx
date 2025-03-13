"use client";

import React, { useState, useEffect } from 'react';
import { Todo as TodoType } from '@/types/todo';
import TodoForm from './TodoForm';
import TodoList from './TodoList';

interface StoredTodo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

const Todo: React.FC = () => {
  const [todos, setTodos] = useState<TodoType[]>([]);

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        // Parse the JSON string and convert date strings back to Date objects
        const parsedTodos = JSON.parse(savedTodos).map((todo: StoredTodo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
        setTodos(parsedTodos);
      } catch (error) {
        console.error('Failed to parse todos from localStorage:', error);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: TodoType = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Todo List
      </h2>
      <TodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
};

export default Todo;
