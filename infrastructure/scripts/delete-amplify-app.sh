#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}
AWS_PROFILE=${2:-default}

# Display usage information if help flag is provided
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  echo "Usage: $0 [environment] [aws-profile]"
  echo ""
  echo "Arguments:"
  echo "  environment     Environment to target (dev, staging, production). Default: dev"
  echo "  aws-profile     AWS profile to use. Default: default"
  echo ""
  echo "Examples:"
  echo "  $0 dev my-profile      # Delete the Amplify app for the dev environment"
  exit 0
fi

echo "Deleting Amplify app for environment: $ENVIRONMENT"
echo "Using AWS profile: $AWS_PROFILE"

# Get AWS region
if [ -f ".env" ]; then
  source .env
elif [ -f "load-env.sh" ]; then
  source load-env.sh
else
  AWS_REGION=$(aws configure get region --profile "$AWS_PROFILE")
  export AWS_REGION
fi

# Get Amplify app ID
AMPLIFY_APP_ID=$(aws amplify list-apps --profile "$AWS_PROFILE" --query "apps[?name=='todo-app-$ENVIRONMENT'].appId" --output text)

if [ -z "$AMPLIFY_APP_ID" ]; then
  echo "Error: Could not find Amplify app for environment $ENVIRONMENT"
  exit 1
fi

echo "Found Amplify app ID: $AMPLIFY_APP_ID"

# Confirm deletion
read -p "Are you sure you want to delete the Amplify app $AMPLIFY_APP_ID? This action cannot be undone. (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deletion cancelled"
  exit 0
fi

# Delete the Amplify app
echo "Deleting Amplify app $AMPLIFY_APP_ID..."
aws amplify delete-app --app-id "$AMPLIFY_APP_ID" --profile "$AWS_PROFILE"

echo "Amplify app deleted successfully"
echo ""
echo "You can now redeploy the infrastructure with:"
echo "./scripts/deploy.sh $ENVIRONMENT [branch] $AWS_PROFILE" 