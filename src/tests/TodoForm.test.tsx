import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoForm from '@/components/Todo/TodoForm';

describe('TodoForm Component', () => {
  const mockAddTodo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the input and button', () => {
    render(<TodoForm onAdd={mockAddTodo} />);
    expect(screen.getByTestId('todo-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-todo-button')).toBeInTheDocument();
  });

  it('updates input value when typing', () => {
    render(<TodoForm onAdd={mockAddTodo} />);
    const input = screen.getByTestId('todo-input');
    fireEvent.change(input, { target: { value: 'New Todo' } });
    expect(input).toHaveValue('New Todo');
  });

  it('calls onAdd with input value when form is submitted', () => {
    render(<TodoForm onAdd={mockAddTodo} />);
    const input = screen.getByTestId('todo-input');
    const button = screen.getByTestId('add-todo-button');

    fireEvent.change(input, { target: { value: 'New Todo' } });
    fireEvent.click(button);

    expect(mockAddTodo).toHaveBeenCalledWith('New Todo');
    expect(input).toHaveValue(''); // Input should be cleared after submission
  });

  it('does not call onAdd when input is empty', () => {
    render(<TodoForm onAdd={mockAddTodo} />);
    const button = screen.getByTestId('add-todo-button');

    fireEvent.click(button);
    expect(mockAddTodo).not.toHaveBeenCalled();
  });

  it('does not call onAdd when input contains only whitespace', () => {
    render(<TodoForm onAdd={mockAddTodo} />);
    const input = screen.getByTestId('todo-input');
    const button = screen.getByTestId('add-todo-button');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button);

    expect(mockAddTodo).not.toHaveBeenCalled();
  });
});
