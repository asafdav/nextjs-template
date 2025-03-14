# AWS Amplify Deployment Guide

This guide provides step-by-step instructions for deploying the Next.js Todo application to AWS Amplify.

## Prerequisites

- An AWS account with appropriate permissions
- GitHub repository with the application code
- AWS credentials configured as described in [amplify-setup.md](./amplify-setup.md)

## Connecting the GitHub Repository to AWS Amplify Console

1. **Log in to AWS Management Console**:

   - Go to [AWS Management Console](https://aws.amazon.com/console/)
   - Sign in with your AWS account credentials

2. **Navigate to the Amplify Service**:

   - In the search bar at the top, type "Amplify" and select "AWS Amplify" from the dropdown
   - Alternatively, find Amplify under the "Mobile" or "Front-end Web & Mobile" section

3. **Create a New Amplify App**:

   - Click on the "New app" button in the top-right corner
   - Select "Host web app" from the options

4. **Connect to GitHub**:
   - Choose "GitHub" as the repository source
   - Click "Continue"
   - If prompted, authorize AWS Amplify to access your GitHub account
   - Select the repository `nextjs-template` from the list
   - Choose the `main` branch for deployment
   - Click "Next"

## Configuring Build Settings

1. **Review the Auto-Generated Build Specification**:

   - Amplify will detect that this is a Next.js application and generate a build specification
   - Compare the auto-generated specification with our custom `amplify.yml` file
   - If needed, replace the auto-generated specification with our custom configuration:

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

2. **Add Environment Variables (if needed)**:

   - Scroll down to the "Environment variables" section
   - Click "Add environment variable"
   - Add any necessary environment variables for your application:
     - `AMPLIFY_REGION`: `us-east-1` (or your preferred region)
     - Add any other environment variables your application needs

3. **Configure Domain Settings (Optional)**:

   - After the initial deployment, you can configure a custom domain
   - Go to the "Domain management" section in the Amplify Console
   - Follow the instructions to set up a custom domain

4. **Save and Deploy**:
   - Click "Save and deploy" to start the deployment process
   - Amplify will clone your repository, build the application, and deploy it

## Monitoring the Deployment

1. **View Deployment Status**:

   - After initiating the deployment, you'll be taken to the Amplify Console dashboard
   - You can monitor the progress of the deployment in real-time
   - The deployment process includes several phases: Provision, Build, Deploy, and Verify

2. **Troubleshooting Deployment Issues**:

   - If the deployment fails, you can view the logs to identify the issue
   - Common issues include:
     - Missing environment variables
     - Build errors
     - Incompatible dependencies

3. **Accessing the Deployed Application**:
   - Once the deployment is successful, you can access your application using the provided URL
   - The URL will be in the format: `https://main.XXXXXXXXXX.amplifyapp.com`

## Continuous Deployment

AWS Amplify automatically sets up continuous deployment for your application:

1. **Automatic Deployments**:

   - Any changes pushed to the `main` branch will trigger a new deployment
   - You can view the deployment history in the Amplify Console

2. **Preview Deployments**:
   - Amplify can also create preview deployments for pull requests
   - To enable this feature, go to "Preview" in the Amplify Console and enable "Pull request previews"

## GitHub Actions Integration

This project includes an enhanced GitHub Actions workflow for automated deployments to AWS Amplify:

1. **Setting up GitHub Secrets**:

   To enable the GitHub Actions workflow to deploy to AWS Amplify, you need to add the following secrets to your GitHub repository:

   - Go to your GitHub repository
   - Navigate to "Settings" > "Secrets and variables" > "Actions"
   - Click "New repository secret" and add the following secrets:
     - `AWS_ACCESS_KEY_ID`: Your AWS access key ID
     - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key

   These credentials should have permissions to deploy to AWS Amplify. It's recommended to create an IAM user with only the necessary permissions for security best practices.

2. **Workflow Features**:

   The GitHub Actions workflow (`deploy.yml`) provides the following features:

   - **Continuous Integration**: Runs tests, linting, and builds on every PR and push to main
   - **Preview Deployments**: Deploys a preview version for each PR and comments with the preview URL
   - **Production Deployment**: Automatically deploys to production when changes are merged to main
   - **Deployment Notifications**: Comments on commits with deployment status

3. **Customizing the Workflow**:

   You can customize the workflow by editing the `.github/workflows/deploy.yml` file:

   - Modify the Node.js version
   - Add additional build or test steps
   - Configure environment-specific variables
   - Adjust the deployment strategy

## Next Steps

After successfully deploying your application, consider:

1. **Setting up branch-based deployments** for development, staging, and production environments
2. **Configuring custom domains** for your application
3. **Setting up monitoring and alerts** for your application
4. **Implementing authentication** using AWS Cognito

For more information, refer to the [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/).
