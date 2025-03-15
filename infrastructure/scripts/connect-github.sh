#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}
AWS_PROFILE=${2:-default}

# Display usage information if help flag is provided
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  echo "Usage: $0 [environment] [aws-profile]"
  echo ""
  echo "Arguments:"
  echo "  environment     Environment to connect (dev, staging, production). Default: dev"
  echo "  aws-profile     AWS profile to use. Default: default"
  echo ""
  echo "Examples:"
  echo "  $0 dev my-profile      # Connect GitHub to the dev environment Amplify app"
  echo ""
  echo "This script opens the AWS Amplify Console for manual GitHub connection."
  echo "It does NOT automatically connect GitHub - you must complete the steps in the console."
  echo ""
  echo "NOTE: AWS Amplify is migrating from OAuth to GitHub Apps for repository access."
  echo "      When prompted to 'Migrate to our GitHub app', click 'Start migration' and"
  echo "      follow the steps to complete the migration. This is required by AWS and"
  echo "      provides better security with fewer required permissions."
  exit 0
fi

echo "=== AWS Amplify Native GitHub Integration ==="
echo "This script will open the Amplify Console where you can manually connect your GitHub repository."
echo "Environment: $ENVIRONMENT"
echo "AWS Profile: $AWS_PROFILE"
echo ""
echo "IMPORTANT: If you see a 'Migrate to our GitHub app' prompt, please click 'Start migration'"
echo "           and follow the steps to complete the migration. This is a required update from AWS."

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
  echo "Make sure you've deployed the infrastructure first with:"
  echo "./scripts/deploy.sh $ENVIRONMENT main $AWS_PROFILE"
  exit 1
fi

# Open the Amplify Console
echo "Opening Amplify Console for connecting to GitHub..."
AMPLIFY_CONSOLE_URL="https://$AWS_REGION.console.aws.amazon.com/amplify/home?region=$AWS_REGION#/$AMPLIFY_APP_ID"

if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$AMPLIFY_CONSOLE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open "$AMPLIFY_CONSOLE_URL"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  start "$AMPLIFY_CONSOLE_URL"
else
  echo "Please open the following URL in your browser:"
  echo "$AMPLIFY_CONSOLE_URL"
fi

echo ""
echo "=== IMPORTANT: Manual Steps Required ==="
echo "Follow these steps in the Amplify Console:"
echo "1. Click 'Connect branch'"
echo "2. Choose GitHub as the repository provider"
echo "3. Authorize AWS Amplify to access your GitHub account"
echo "4. Select your repository and branch"
echo "5. Click 'Connect branch'"
echo ""
echo "After connecting your repository:"
echo "- Amplify will automatically build and deploy your application"
echo "- Auto branch creation settings will take effect"
echo "- New branches matching the patterns will be automatically detected"
echo ""
echo "Note: This is using Amplify's native GitHub integration, not the CDK GitHubSourceCodeProvider." 