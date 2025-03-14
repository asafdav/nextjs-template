#!/bin/bash
set -e

# Default environment is dev
ENVIRONMENT=${1:-dev}
BRANCH=${2:-$ENVIRONMENT}
AWS_PROFILE=${3:-default}
REPOSITORY_URL=""

# Parse additional arguments
shift 3 2>/dev/null || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repository-url=*)
      REPOSITORY_URL="${1#*=}"
      shift
      ;;
    *)
      echo "Unknown parameter: $1"
      exit 1
      ;;
  esac
done

# Display usage information if help flag is provided
if [[ "$ENVIRONMENT" == "-h" || "$ENVIRONMENT" == "--help" ]]; then
  echo "Usage: $0 [environment] [branch] [aws-profile] [--repository-url=URL]"
  echo ""
  echo "Arguments:"
  echo "  environment                 Environment to deploy (dev, staging, production). Default: dev"
  echo "  branch                      Git branch to deploy. Default: same as environment"
  echo "  aws-profile                 AWS profile to use. Default: default"
  echo "  --repository-url=URL        GitHub repository URL. Default: auto-detected from git config"
  echo ""
  echo "Examples:"
  echo "  $0 dev main my-profile                                      # Deploy dev environment with main branch"
  echo "  $0 dev main my-profile --repository-url=https://github.com/owner/repo  # Specify repository URL"
  echo ""
  echo "Prerequisites:"
  echo "  1. Set up your GitHub token in AWS Secrets Manager using:"
  echo "     ./scripts/setup-github-token.sh [aws-profile] <github-token>"
  echo ""
  echo "Note: The deployment will automatically connect to your GitHub repository"
  echo "      if you've set up the GitHub token in AWS Secrets Manager."
  exit 0
fi

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
  echo "Error: Environment must be one of: dev, staging, production"
  exit 1
fi

# Check if AWS environment variables are set
if [ -z "$CDK_DEFAULT_ACCOUNT" ] || [ -z "$CDK_DEFAULT_REGION" ]; then
  echo "AWS environment variables are not set."
  
  # Check if .env file exists
  if [ -f ".env" ]; then
    echo "Loading environment variables from .env file..."
    source .env
  elif [ -f "load-env.sh" ]; then
    echo "Loading environment variables from load-env.sh..."
    source load-env.sh
  else
    echo "Environment files not found. Getting AWS account and region from profile..."
    
    # Get AWS account ID and region from the profile
    if ! AWS_ACCOUNT_ID=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query "Account" --output text 2>/dev/null); then
      echo "Error: Could not get AWS account ID from profile '$AWS_PROFILE'"
      echo "Please run './scripts/configure-aws.sh $AWS_PROFILE' first to set up AWS credentials."
      exit 1
    fi
    
    if ! AWS_REGION=$(aws configure get region --profile "$AWS_PROFILE" 2>/dev/null); then
      echo "Error: Could not get AWS region from profile '$AWS_PROFILE'"
      echo "Please run './scripts/configure-aws.sh $AWS_PROFILE' first to set up AWS credentials."
      exit 1
    fi
    
    # Set environment variables
    export CDK_DEFAULT_ACCOUNT=$AWS_ACCOUNT_ID
    export CDK_DEFAULT_REGION=$AWS_REGION
  fi
fi

# Always export AWS_PROFILE from parameter
export AWS_PROFILE=$AWS_PROFILE
echo "Using AWS profile: $AWS_PROFILE"

# Get the repository URL from git config if not provided
if [ -z "$REPOSITORY_URL" ]; then
  REPOSITORY_URL=$(git config --get remote.origin.url)
  if [ -z "$REPOSITORY_URL" ]; then
    echo "Warning: Could not determine repository URL from git config."
    echo "This may prevent automatic GitHub integration."
    echo "Consider providing it with --repository-url=https://github.com/owner/repo"
    REPOSITORY_URL="https://github.com/asafdav/nextjs-template"
  fi

  # Convert SSH URL to HTTPS URL if needed
  if [[ "$REPOSITORY_URL" == git@github.com:* ]]; then
    REPOSITORY_URL="https://github.com/${REPOSITORY_URL#git@github.com:}"
    # Remove .git suffix if present
    REPOSITORY_URL="${REPOSITORY_URL%.git}"
  fi
fi

echo "Deploying infrastructure for environment: $ENVIRONMENT, branch: $BRANCH"
echo "Using AWS Account: $CDK_DEFAULT_ACCOUNT, Region: $CDK_DEFAULT_REGION, Profile: $AWS_PROFILE"
echo "Repository URL: $REPOSITORY_URL"

# Check if the GitHub token is set up in AWS Secrets Manager
if ! aws secretsmanager describe-secret --secret-id github-token --profile "$AWS_PROFILE" &>/dev/null; then
  echo "Warning: GitHub token is not set up in AWS Secrets Manager."
  echo "The Amplify app will be created without GitHub integration."
  echo "To set up GitHub integration, run:"
  echo "./scripts/setup-github-token.sh $AWS_PROFILE <github-token>"
  echo "Then redeploy the infrastructure."
  echo ""
  echo "Continuing with deployment..."
else
  echo "GitHub token found in AWS Secrets Manager."
  echo "The Amplify app will be created with automatic GitHub integration."
  echo ""
fi

# Navigate to the infrastructure directory
cd "$(dirname "$0")/.."

# Install dependencies
npm install

# Build the CDK app
npm run build

# Prepare CDK deploy command
CDK_DEPLOY_CMD="npx cdk deploy \"TodoApp-$ENVIRONMENT\" \
  --profile \"$AWS_PROFILE\" \
  --context environment=$ENVIRONMENT \
  --context branch=$BRANCH \
  --context repositoryUrl=$REPOSITORY_URL \
  --context aws-account=$CDK_DEFAULT_ACCOUNT \
  --context aws-region=$CDK_DEFAULT_REGION \
  --require-approval never"

# Execute the CDK deploy command
echo "Executing: $CDK_DEPLOY_CMD"
echo "Using AWS Account: $CDK_DEFAULT_ACCOUNT, Region: $CDK_DEFAULT_REGION, Profile: $AWS_PROFILE"
eval "$CDK_DEPLOY_CMD"
DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -ne 0 ]; then
  echo "Deployment failed with status code $DEPLOY_STATUS"
  echo ""
  echo "If the error is about 'manually deployed branch still exists', you need to delete all branches:"
  echo "./scripts/delete-amplify-branches.sh $ENVIRONMENT $AWS_PROFILE"
  echo ""
  echo "Then try deploying again:"
  echo "./scripts/deploy.sh $ENVIRONMENT $BRANCH $AWS_PROFILE"
  echo ""
  echo "If the issue persists, you may need to delete the Amplify app and start fresh:"
  echo "./scripts/delete-amplify-app.sh $ENVIRONMENT $AWS_PROFILE"
  exit $DEPLOY_STATUS
fi

echo "Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Find the Amplify Console URL in the output above"
echo "2. Go to the Amplify Console to verify that your app is connected to GitHub"
echo "3. If you see a 'Migrate to our GitHub app' prompt:"
echo "   a. Click 'Start migration'"
echo "   b. Follow the steps to install the AWS Amplify GitHub App"
echo "   c. This migration is required by AWS and provides better security"
echo ""
echo "If the GitHub connection was not established automatically, check:"
echo "1. Your GitHub token in AWS Secrets Manager (should have repo and admin:repo_hook permissions)"
echo "2. The repository URL used for deployment: $REPOSITORY_URL"
echo "3. You can redeploy with a specific repository URL:"
echo "   ./scripts/deploy.sh $ENVIRONMENT $BRANCH $AWS_PROFILE --repository-url=https://github.com/owner/repo"
echo ""
echo "Once connected, Amplify will automatically build and deploy your application when you push to your repository." 