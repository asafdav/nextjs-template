import React from 'react';
import { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <li className="flex items-center justify-between p-4 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="w-5 h-5 mr-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
          aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        <span
          className={`text-lg ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
        >
          {todo.text}
        </span>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
        aria-label={`Delete "${todo.text}"`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </li>
  );
};

export default TodoItem;
