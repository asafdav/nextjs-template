#!/bin/bash

# Script to help connect GitHub repository to AWS Amplify
# This script will open the AWS Amplify console for connecting to GitHub

# Configuration
APP_ID="d2tj903phht9yk"
BRANCH_NAME="fix/todo-app-static-export"
REGION="us-east-1"
AWS_PROFILE="vim-ai-admin"

# Print usage information
echo "=== Connect GitHub to AWS Amplify ==="
echo "This script will open the AWS Amplify Console for connecting your GitHub repository."
echo "App ID: $APP_ID"
echo "Branch: $BRANCH_NAME"
echo "Region: $REGION"
echo "AWS Profile: $AWS_PROFILE"
echo ""

# Open the Amplify Console
CONSOLE_URL="https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID/$BRANCH_NAME/connect"
echo "Opening AWS Amplify Console at: $CONSOLE_URL"
echo ""

# Instructions for connecting GitHub
echo "=== Instructions for connecting GitHub ==="
echo "1. In the AWS Amplify Console, click 'Connect branch'"
echo "2. Choose GitHub as the repository provider"
echo "3. Authorize AWS Amplify to access your GitHub account if prompted"
echo "4. Select the 'nextjs-template' repository"
echo "5. Select 'fix/todo-app-static-export' as the branch"
echo "6. Click 'Connect branch'"
echo ""
echo "After connecting, Amplify will automatically detect changes to your repository"
echo "and deploy them to your Amplify app."
echo ""

# Open the URL in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$CONSOLE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$CONSOLE_URL"
else
    echo "Please open the following URL in your browser:"
    echo "$CONSOLE_URL"
fi

echo "Once connected, your static site will be available at:"
echo "https://$BRANCH_NAME.$APP_ID.amplifyapp.com" 