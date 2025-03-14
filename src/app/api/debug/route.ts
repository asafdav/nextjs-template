import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Debug API endpoint called at:', new Date().toISOString());
  
  // Collect environment variables (only public ones)
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    REGION: process.env.REGION,
    TODO_TABLE_NAME: process.env.TODO_TABLE_NAME,
    ASSETS_BUCKET: process.env.ASSETS_BUCKET,
  };
  
  console.log('Environment variables:', envVars);
  
  // Collect server information
  const serverInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
  
  console.log('Server information:', serverInfo);
  
  // Return all collected information
  return NextResponse.json({
    status: 'ok',
    message: 'Debug information',
    environment: envVars,
    server: serverInfo,
  });
} 