#!/bin/bash
set -e

# Default profile is 'default'
AWS_PROFILE=${1:-default}

# Display usage information if help flag is provided
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  echo "Usage: $0 [aws-profile]"
  echo ""
  echo "Arguments:"
  echo "  aws-profile                 AWS profile to use. Default: default"
  echo ""
  echo "Examples:"
  echo "  $0 my-profile               # Configure AWS with my-profile"
  exit 0
fi

echo "Using AWS profile: $AWS_PROFILE"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS CLI is configured with the specified profile
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
    echo "AWS profile '$AWS_PROFILE' is not configured or doesn't have valid credentials."
    echo "Run: aws configure --profile $AWS_PROFILE"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query "Account" --output text)
echo "AWS Account ID: $AWS_ACCOUNT_ID"

# Get current AWS region
AWS_REGION=$(aws configure get region --profile "$AWS_PROFILE")
echo "AWS Region: $AWS_REGION"

# Get IAM user information
IAM_USER=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query "Arn" --output text)
echo "IAM User: $IAM_USER"

# Create or update .env file with AWS account, region, and profile
cat > .env << EOF
CDK_DEFAULT_ACCOUNT=$AWS_ACCOUNT_ID
CDK_DEFAULT_REGION=$AWS_REGION
AWS_PROFILE=$AWS_PROFILE
EOF

echo "AWS configuration saved to .env file."
echo "To use these settings, run: source .env"

# Create a helper script to load environment variables
cat > load-env.sh << EOF
#!/bin/bash
export CDK_DEFAULT_ACCOUNT=$AWS_ACCOUNT_ID
export CDK_DEFAULT_REGION=$AWS_REGION
export AWS_PROFILE=$AWS_PROFILE

echo "AWS environment variables set:"
echo "CDK_DEFAULT_ACCOUNT=$AWS_ACCOUNT_ID"
echo "CDK_DEFAULT_REGION=$AWS_REGION"
echo "AWS_PROFILE=$AWS_PROFILE"
EOF

chmod +x load-env.sh
echo "Created load-env.sh script. Run 'source load-env.sh' to set environment variables."

# Bootstrap CDK in the account/region if needed
echo "Do you want to bootstrap CDK in this account/region? (y/n)"
read -r BOOTSTRAP

if [[ "$BOOTSTRAP" =~ ^[Yy]$ ]]; then
    echo "Bootstrapping CDK in account $AWS_ACCOUNT_ID, region $AWS_REGION using profile $AWS_PROFILE..."
    cd ..
    
    # Try to bootstrap with the current profile
    if npx cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION --profile "$AWS_PROFILE"; then
        echo "CDK bootstrapped successfully."
    else
        echo ""
        echo "===== BOOTSTRAP FAILED ====="
        echo "The CDK bootstrap process failed. This is likely due to insufficient permissions."
        echo ""
        echo "The IAM user ($IAM_USER) needs the following permissions:"
        echo "- CloudFormation: CreateChangeSet, CreateStack, DescribeStacks, etc."
        echo "- ECR: CreateRepository, DescribeRepositories, etc."
        echo "- SSM: PutParameter, GetParameter, etc."
        echo "- S3: CreateBucket, PutObject, etc."
        echo "- IAM: CreateRole, AttachRolePolicy, etc."
        echo ""
        echo "You can fix this by:"
        echo "1. Adding the following managed policies to your IAM user:"
        echo "   - AmazonECR-FullAccess"
        echo "   - AWSCloudFormationFullAccess"
        echo "   - AmazonSSMFullAccess"
        echo "   - AmazonS3FullAccess"
        echo ""
        echo "2. Or using a profile with administrator access for bootstrapping:"
        echo "   ./scripts/configure-aws.sh admin-profile"
        echo ""
        echo "After fixing the permissions, you can run bootstrap manually:"
        echo "source load-env.sh"
        echo "npm run bootstrap"
        echo "=========================="
    fi
fi

# Print summary
echo ""
echo "===== CONFIGURATION SUMMARY ====="
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"
echo "AWS Profile: $AWS_PROFILE"
echo ""
echo "To deploy your infrastructure, run:"
echo "./scripts/deploy.sh dev main $AWS_PROFILE"
echo ""
echo "After deployment, you'll need to connect your GitHub repository through the Amplify Console."
echo "The deployment output will provide instructions for this."
echo "==================================" 