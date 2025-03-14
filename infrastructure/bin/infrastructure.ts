#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();

// Get environment from context or use default
const environment = app.node.tryGetContext('environment') || 'dev';

// Get repository URL from context
const repositoryUrl =
  app.node.tryGetContext('repositoryUrl') || 'https://github.com/asafdav/nextjs-template.git';

// Get branch from context or default to 'main'
const branch = app.node.tryGetContext('branch') || 'main';

// Get GitHub token secret name from context or use default
const githubTokenSecretName = app.node.tryGetContext('github-token-secret') || 'github-token';

// Get AWS account and region from context or environment variables
const account = app.node.tryGetContext('aws-account') || process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext('aws-region') || process.env.CDK_DEFAULT_REGION;

if (!account || !region) {
  throw new Error(
    'AWS account and region must be provided via context (--context aws-account=XXXX --context aws-region=XXXX) or environment variables (CDK_DEFAULT_ACCOUNT, CDK_DEFAULT_REGION)'
  );
}

console.log(`Deploying to AWS account ${account} in region ${region}`);
console.log(`Environment: ${environment}, Branch: ${branch}`);
console.log(`Repository URL: ${repositoryUrl}`);

// Create the stack
new InfrastructureStack(app, `TodoApp-${environment}`, {
  environment,
  repositoryUrl,
  branch,
  githubTokenSecretName,
  env: { 
    account, 
    region 
  },
});

app.synth();
