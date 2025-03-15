#!/bin/bash
set -e

AWS_PROFILE=${1:-default}
GITHUB_TOKEN=${2}

# Display usage information if help flag is provided or no token is provided
if [[ "$1" == "-h" || "$1" == "--help" || -z "$GITHUB_TOKEN" ]]; then
  echo "Usage: $0 [aws-profile] <github-token>"
  echo ""
  echo "Arguments:"
  echo "  aws-profile     AWS profile to use. Default: default"
  echo "  github-token    GitHub personal access token with repo and admin:repo_hook permissions"
  echo ""
  echo "Examples:"
  echo "  $0 my-profile ghp_1234567890abcdef      # Store GitHub token using my-profile"
  echo ""
  echo "Note: You need to create a GitHub personal access token with 'repo' and 'admin:repo_hook' permissions."
  echo "      Visit https://github.com/settings/tokens to create one."
  echo ""
  echo "IMPORTANT: This script is REQUIRED for automated GitHub integration through CDK."
  echo "The token will be used by the GitHubSourceCodeProvider to connect your repository to Amplify."
  exit 1
fi

echo "Setting up GitHub token in AWS Secrets Manager for automated GitHub integration"
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

# Create a simple JSON string with the token
# We're using a here-document to create a clean JSON without shell variable expansion issues
JSON_FILE=$(mktemp)
cat > "$JSON_FILE" << EOF
{
  "token": "$GITHUB_TOKEN"
}
EOF

# Check if the secret already exists
SECRET_EXISTS=$(aws secretsmanager list-secrets --profile "$AWS_PROFILE" --query "SecretList[?Name=='github-token'].Name" --output text)

if [ -z "$SECRET_EXISTS" ]; then
  # Create the secret
  echo "Creating new secret 'github-token' in AWS Secrets Manager..."
  aws secretsmanager create-secret \
    --name github-token \
    --description "GitHub token for AWS Amplify automated integration" \
    --secret-string file://"$JSON_FILE" \
    --profile "$AWS_PROFILE"
else
  # Update the existing secret
  echo "Updating existing secret 'github-token' in AWS Secrets Manager..."
  aws secretsmanager update-secret \
    --secret-id github-token \
    --description "GitHub token for AWS Amplify automated integration" \
    --secret-string file://"$JSON_FILE" \
    --profile "$AWS_PROFILE"
fi

# Clean up the temporary file
rm -f "$JSON_FILE"

echo "GitHub token successfully stored in AWS Secrets Manager."
echo ""
echo "Next steps:"
echo "1. Deploy your infrastructure with:"
echo "   ./scripts/deploy.sh [environment] [branch] $AWS_PROFILE"
echo ""
echo "2. The deployment will automatically connect your GitHub repository to Amplify"
echo "   using the GitHubSourceCodeProvider in the CDK code."
echo ""
echo "3. If you see a 'Migrate to our GitHub app' prompt in the Amplify Console:"
echo "   - Click 'Start migration'"
echo "   - Follow the steps to install the AWS Amplify GitHub App"
echo "   - This migration is required by AWS and provides better security" 