import { NextRequest, NextResponse } from 'next/server';
import { getTodoById, updateTodo, deleteTodo } from '../store';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const todo = getTodoById(id);

  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  return NextResponse.json(todo);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();

    const updatedTodo = updateTodo(id, {
      ...(body.text && { text: body.text }),
      ...(body.completed !== undefined && { completed: !!body.completed }),
    });

    if (!updatedTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTodo);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const deletedTodo = deleteTodo(id);

  if (!deletedTodo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  return NextResponse.json(deletedTodo);
}
