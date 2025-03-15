import { NextResponse } from 'next/server';
import * as dynamodbService from '@/services/dynamodbService';
import fs from 'fs';
import path from 'path';

// Add these exports to make the route compatible with static export
export const dynamic = 'force-static';
export const revalidate = false;

// Generate static params for the static export
export function generateStaticParams() {
  return [{ id: 'example-id' }];
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    
    // For static export, return a placeholder todo
    if (process.env.NODE_ENV === 'production') {
      const staticTodo = {
        id,
        text: 'Example Todo',
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      // Create a static JSON file for this todo
      const outDir = path.join(process.cwd(), 'out', 'api', 'todos', id);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(staticTodo));
      
      return NextResponse.json(staticTodo);
    }
    
    const todo = await dynamodbService.getTodoById(id);

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error(`Error fetching todo ${(await params).id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch todo' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    
    // For static export, return a placeholder response
    if (process.env.NODE_ENV === 'production') {
      const staticTodo = {
        id,
        text: 'Updated Example Todo',
        completed: true,
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json(staticTodo);
    }
    
    const body = await request.json();

    const updates = {
      ...(body.text && { text: body.text }),
      ...(body.completed !== undefined && { completed: !!body.completed }),
    };

    const updatedTodo = await dynamodbService.updateTodo(id, updates);

    if (!updatedTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error(`Error updating todo ${(await params).id}:`, error);

    // Check if it's a JSON parsing error
    if (error instanceof Error && error.message.includes('JSON')) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    
    // For static export, return a placeholder response
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        message: 'Todo deleted successfully',
        id 
      });
    }
    
    const deletedTodo = await dynamodbService.deleteTodo(id);

    if (!deletedTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json(deletedTodo);
  } catch (error) {
    console.error(`Error deleting todo ${(await params).id}:`, error);
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
