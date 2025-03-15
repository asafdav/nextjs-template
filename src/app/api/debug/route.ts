import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

  // Create the response data
  const responseData = {
    status: 'ok',
    message: 'Debug information',
    environment: envVars,
    server: serverInfo,
  };

  // For static export, write the data to a JSON file
  if (process.env.NODE_ENV === 'production') {
    try {
      const outDir = path.join(process.cwd(), 'out', 'api', 'debug');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'data.json'), JSON.stringify(responseData, null, 2));
      console.log('Debug data written to static file for export');
    } catch (err) {
      console.error('Error writing debug data to file:', err);
    }
  }

  // Return the response
  return NextResponse.json(responseData);
}
