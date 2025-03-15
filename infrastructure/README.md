# Todo App Infrastructure

This directory contains the AWS CDK infrastructure code for the Todo App. The infrastructure is defined as code using AWS CDK with TypeScript.

## Architecture

The Todo App infrastructure consists of the following AWS resources:

- **AWS Amplify**: Hosts the NextJS application and provides CI/CD capabilities
- **Amazon DynamoDB**: Stores Todo items with a global secondary index for querying by completion status
- **Amazon S3**: Stores static assets for the application
- **AWS IAM**: Defines roles and policies for secure access to AWS resources
- **Amazon CloudWatch**: Provides monitoring and alerting for the application

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured
- [AWS CDK](https://aws.amazon.com/cdk/) installed globally (`npm install -g aws-cdk`)
- GitHub personal access token stored in AWS Secrets Manager with the name `github-token`
- AWS IAM user with sufficient permissions (see [Required Permissions](#required-permissions))

## Required Permissions

The AWS IAM user needs the following permissions for CDK bootstrapping and deployment:

### For Bootstrapping (one-time setup)

- CloudFormation: CreateChangeSet, CreateStack, DescribeStacks, etc.
- ECR: CreateRepository, DescribeRepositories, etc.
- SSM: PutParameter, GetParameter, etc.
- S3: CreateBucket, PutObject, etc.
- IAM: CreateRole, AttachRolePolicy, etc.

You can provide these permissions by attaching the following managed policies:

- `AmazonECR-FullAccess`
- `AWSCloudFormationFullAccess`
- `AmazonSSMFullAccess`
- `AmazonS3FullAccess`

### For Deployment

After bootstrapping, the IAM user needs permissions to:

- Create and manage the resources defined in your CDK stacks (DynamoDB, S3, Amplify, etc.)
- Access the CDK bootstrap resources

## Environment Separation

The infrastructure supports three environments:

1. **dev**: Development environment for testing new features
2. **staging**: Pre-production environment for final testing
3. **production**: Production environment for end users

Each environment has its own isolated resources with appropriate configurations.

## Deployment

### Prerequisites

1. Set up AWS credentials for your profile:

   ```bash
   ./scripts/configure-aws.sh [aws-profile]
   ```

2. Set up your GitHub token in AWS Secrets Manager:
   ```bash
   ./scripts/setup-github-token.sh [aws-profile] <github-token>
   ```
   You need to create a GitHub personal access token with 'repo' and 'admin:repo_hook' permissions.
   Visit https://github.com/settings/tokens to create one.

### Deploy the infrastructure

```bash
./scripts/deploy.sh [environment] [branch] [aws-profile]
```

Example:

```bash
./scripts/deploy.sh dev main my-profile
```

This will:

1. Deploy the infrastructure for the specified environment
2. Create an Amplify app connected to your GitHub repository
3. Set up the necessary IAM roles and permissions

### Initial Setup

Before deploying, you need to configure your AWS credentials and bootstrap the CDK:

1. Make sure your AWS CLI is configured with the appropriate credentials:

   ```bash
   aws configure --profile your-profile-name
   ```

2. Run the configuration script to set up the AWS environment variables:

   ```bash
   # Using default profile
   ./scripts/configure-aws.sh

   # Using a specific profile (e.g., vim-ai)
   ./scripts/configure-aws.sh vim-ai
   ```

   This script will:

   - Verify your AWS CLI configuration for the specified profile
   - Create environment files with your AWS account ID, region, and profile
   - Offer to bootstrap CDK in your account/region

3. Load the environment variables:
   ```bash
   source load-env.sh
   ```

### Bootstrapping CDK

If you didn't bootstrap during the configuration step, or if it failed due to permission issues, you can do it manually after fixing the permissions:

```bash
# Using the profile from load-env.sh
npm run bootstrap

# Using a specific profile
npx cdk bootstrap aws://ACCOUNT-NUMBER/REGION --profile your-profile-name
```

If bootstrapping fails, make sure your IAM user has the required permissions as described in the [Required Permissions](#required-permissions) section.

### Deploying to an Environment

To deploy the infrastructure to a specific environment, use the deployment script:

```bash
# Using default or previously configured profile
./scripts/deploy.sh <environment> [branch]

# Using a specific profile
./scripts/deploy.sh <environment> [branch] <profile>
```

Where:

- `<environment>` is one of: `dev`, `staging`, or `production`
- `[branch]` (optional) is the GitHub branch to deploy. If not specified, it defaults to the environment name (for production, it defaults to `main`)
- `<profile>` (optional) is the AWS profile to use. If not specified, it uses the default profile or the one from load-env.sh

For example:

```bash
# Deploy dev environment using the 'dev' branch and default profile
./scripts/deploy.sh dev

# Deploy staging environment using the 'feature/new-ui' branch and default profile
./scripts/deploy.sh staging feature/new-ui

# Deploy production environment using the 'main' branch and 'vim-ai' profile
./scripts/deploy.sh production main vim-ai
```

### GitHub Actions Integration

The repository includes GitHub Actions workflows that automatically deploy the infrastructure when changes are pushed to specific branches:

- Push to `dev` branch: Deploys to the dev environment
- Push to `staging` branch: Deploys to the staging environment
- Push to `main` branch: Deploys to the production environment

## Infrastructure Components

### Base Stack

The Base Stack (`BaseStack`) contains the foundational resources:

- DynamoDB table for Todo items
- S3 bucket for static assets
- CloudWatch dashboard and alarms

### Amplify Stack

The Amplify Stack (`AmplifyStack`) contains the application hosting resources:

- Amplify application connected to the GitHub repository
- Branch configurations for different environments
- IAM roles and policies for Amplify to access DynamoDB and S3

## Security

The infrastructure follows AWS security best practices:

- Least privilege IAM policies
- Encryption for data at rest and in transit
- Secure handling of secrets
- Environment isolation

## Monitoring

CloudWatch dashboards and alarms are set up to monitor:

- DynamoDB read/write capacity
- DynamoDB throttled requests
- Application errors and performance

## Troubleshooting

### Common Issues

1. **AWS Account Resolution Error**:
   If you see "Unable to resolve AWS account to use", make sure you've run:
   ```bash
   source load-env.sh
   ```
2. **CDK Bootstrap Error**:
   If you see errors about missing CDK bootstrap resources, run:

   ```bash
   npm run bootstrap
   ```

3. **Permission Errors During Bootstrap**:
   If you see errors like "User is not authorized to perform: cloudformation:CreateChangeSet" or "ecr:CreateRepository", your IAM user needs additional permissions. See the [Required Permissions](#required-permissions) section.

4. **Dependency Errors**:
   If you encounter dependency errors, try:

   ```bash
   npm ci
   ```

5. **AWS Profile Issues**:
   If you're having issues with AWS profiles, verify your profile configuration:
   ```bash
   aws sts get-caller-identity --profile your-profile-name
   ```

## Cleanup

To remove the infrastructure from an environment, use the AWS CDK destroy command:

```bash
# Using default or previously configured profile
npx cdk destroy TodoApp-<environment>

# Using a specific profile
npx cdk destroy TodoApp-<environment> --profile your-profile-name
```

**Note**: This will delete all resources created by the CDK stack. Data in DynamoDB tables and S3 buckets with deletion protection (in production) will be retained.

## GitHub Integration with AWS Amplify

This project uses **AWS CDK's GitHubSourceCodeProvider** to automatically connect your GitHub repository to Amplify. This approach offers several advantages:

- **Fully automated setup**: No manual steps required in the Amplify Console
- **Infrastructure as code**: GitHub integration is defined in your CDK code
- **Reproducible deployments**: Consistent setup across environments
- **Automatic branch detection**: New branches matching patterns are automatically detected
- **Pull request previews**: Preview deployments for pull requests

### GitHub App Migration

AWS Amplify is migrating from OAuth-based GitHub integration to GitHub Apps. When you see the "Migrate to our GitHub app" prompt in the Amplify Console, you should proceed with the migration:

1. Click the "Start migration" button in the Amplify Console
2. Follow the prompts to install the AWS Amplify GitHub App
3. Select the repositories you want to give Amplify access to
4. Complete the authorization process

Benefits of the GitHub App integration:

- Requires fewer permissions than the OAuth integration
- More granular control over which repositories Amplify can access
- Improved security posture
- Same functionality for branch detection and deployments

This migration is required by AWS and does not affect your infrastructure code or deployment process.

## Setup Instructions

### 1. Store GitHub Token in AWS Secrets Manager

Before deploying, you need to store your GitHub personal access token in AWS Secrets Manager:

```bash
./scripts/setup-github-token.sh [aws-profile] <github-token>
```

You need to create a GitHub personal access token with 'repo' and 'admin:repo_hook' permissions.
Visit https://github.com/settings/tokens to create one.

### 2. Deploy the Infrastructure

```bash
# Deploy the infrastructure for the dev environment
./scripts/deploy.sh dev main [aws-profile]
```

This will:

1. Deploy the infrastructure for the specified environment
2. Create an Amplify app connected to your GitHub repository using the token from Secrets Manager
3. Set up auto branch creation and other configurations

### 3. Auto Branch Creation

Once deployed, the auto branch creation settings will take effect. Branches matching these patterns will be automatically detected:

- `main`
- `dev`
- `feature/*`
- `release/*`

## Troubleshooting

### GitHub Integration Failed

If the GitHub integration fails to set up automatically:

1. Check that your GitHub token is correctly stored in AWS Secrets Manager

   ```bash
   aws secretsmanager get-secret-value --secret-id github-token --query SecretString --output text
   ```

2. Verify that the token has the necessary permissions (repo, admin:repo_hook)

3. Check that your repository URL is correctly specified in the deployment command

   ```bash
   ./scripts/deploy.sh dev main [aws-profile] --repository-url=https://github.com/owner/repo
   ```

4. If issues persist, you can fall back to manual connection through the Amplify Console
   ```bash
   ./scripts/connect-github.sh dev [aws-profile]
   ```

### Branch Not Detected

If a new branch is not automatically detected:

1. Verify the branch name matches one of the patterns in `autoBranchCreationConfig`
2. Check that the GitHub repository is properly connected in the Amplify Console
3. Try manually connecting the branch through the Amplify Console

## Scripts

- `deploy.sh`: Deploy the infrastructure
- `connect-github.sh`: Open the Amplify Console for connecting GitHub
- `delete-amplify-app.sh`: Delete the Amplify app (use with caution)
- `delete-amplify-branches.sh`: Delete all branches in the Amplify app

## Important Notes

- The `setup-github-token.sh` script is **not needed** for the native GitHub integration
- The CDK code does not use `GitHubSourceCodeProvider` - connection is done through the Amplify Console
- Auto branch creation settings are applied in the CDK but only take effect after connecting GitHub
