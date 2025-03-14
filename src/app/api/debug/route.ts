import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

export async function GET() {
  console.log('Debug API endpoint called at:', new Date().toISOString());
  
  // Collect environment variables (only public ones)
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    REGION: process.env.REGION,
    TODO_TABLE_NAME: process.env.TODO_TABLE_NAME,
    ASSETS_BUCKET: process.env.ASSETS_BUCKET,
    // Add any other environment variables you want to expose
  };
  
  console.log('Environment variables:', envVars);
  
  // Test DynamoDB connection
  let dynamoDbStatus = 'unknown';
  let dynamoDbError = null;
  
  try {
    console.log('Testing DynamoDB connection...');
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || 'us-east-1',
    });
    
    // Just initialize the client to check for configuration errors
    dynamoDbStatus = 'configured';
    console.log('DynamoDB client configured successfully');
  } catch (err) {
    console.error('DynamoDB configuration error:', err);
    dynamoDbStatus = 'error';
    dynamoDbError = err instanceof Error ? err.message : String(err);
  }
  
  // Test S3 connection
  let s3Status = 'unknown';
  let s3Error = null;
  
  try {
    console.log('Testing S3 connection...');
    const s3Client = new S3Client({
      region: process.env.REGION || 'us-east-1',
    });
    
    // Just initialize the client to check for configuration errors
    s3Status = 'configured';
    console.log('S3 client configured successfully');
  } catch (err) {
    console.error('S3 configuration error:', err);
    s3Status = 'error';
    s3Error = err instanceof Error ? err.message : String(err);
  }
  
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
    services: {
      dynamoDB: {
        status: dynamoDbStatus,
        error: dynamoDbError,
        tableName: process.env.TODO_TABLE_NAME,
      },
      s3: {
        status: s3Status,
        error: s3Error,
        bucketName: process.env.ASSETS_BUCKET,
      },
    },
    server: serverInfo,
  });
} 