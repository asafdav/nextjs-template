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
  echo "  $0 dev my-profile      # Delete branches in the dev environment Amplify app"
  exit 0
fi

echo "Deleting branches in Amplify app for environment: $ENVIRONMENT"
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

# List all branches
echo "Listing branches for Amplify app $AMPLIFY_APP_ID..."
BRANCHES=$(aws amplify list-branches --app-id "$AMPLIFY_APP_ID" --profile "$AWS_PROFILE" --query "branches[].branchName" --output text)

if [ -z "$BRANCHES" ]; then
  echo "No branches found for Amplify app $AMPLIFY_APP_ID"
  exit 0
fi

echo "Found branches: $BRANCHES"
echo "Deleting branches..."

# Delete each branch
for BRANCH in $BRANCHES; do
  echo "Deleting branch: $BRANCH"
  aws amplify delete-branch --app-id "$AMPLIFY_APP_ID" --branch-name "$BRANCH" --profile "$AWS_PROFILE"
  echo "Branch $BRANCH deleted successfully"
done

echo "All branches deleted successfully"
echo ""
echo "You can now connect your Amplify app to GitHub by running:"
echo "./scripts/setup-github-token.sh $AWS_PROFILE <github-token>"
echo "Then redeploy the infrastructure:"
echo "./scripts/deploy.sh $ENVIRONMENT [branch] $AWS_PROFILE" 