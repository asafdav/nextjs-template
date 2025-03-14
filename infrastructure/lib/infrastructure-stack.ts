import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

/**
 * Properties for the InfrastructureStack
 */
export interface InfrastructureStackProps extends cdk.StackProps {
  /**
   * The environment name (e.g., 'dev', 'staging', 'prod')
   */
  environment: string;

  /**
   * The GitHub repository URL (e.g., 'https://github.com/owner/repo')
   * Used for documentation and environment variables only
   */
  repositoryUrl?: string;

  /**
   * The branch to deploy (e.g., 'main', 'develop')
   * @default 'main'
   */
  branch?: string;
}

/**
 * Infrastructure stack for the Todo application
 */
export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    // Set default branch if not provided
    const branch = props.branch || 'main';

    // Extract repository information if URL is provided (for documentation only)
    let repoOwner: string | undefined;
    let repoName: string | undefined;

    if (props.repositoryUrl) {
      try {
        // Parse the repository URL to extract owner and name
        const repoUrlMatch = props.repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

        if (repoUrlMatch && repoUrlMatch.length >= 3) {
          repoOwner = repoUrlMatch[1];
          repoName = repoUrlMatch[2];

          // Remove .git suffix if present
          if (repoName.endsWith('.git')) {
            repoName = repoName.slice(0, -4);
          }
        }
      } catch (error) {
        // Just log the error but continue - this is only for documentation
        console.log(
          `Failed to parse repository URL: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Create a DynamoDB table for storing todo items
    const todoTable = new dynamodb.Table(this, 'TodoTable', {
      tableName: `${props.environment}-todo-table`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For non-prod environments
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // Add a GSI for querying by completion status
    todoTable.addGlobalSecondaryIndex({
      indexName: 'CompletedIndex',
      partitionKey: { name: 'completed', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    // Create an S3 bucket for static assets
    const assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: `${props.environment}-todo-assets-${this.account}-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For non-prod environments
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
    });

    // Create an Amplify app without GitHub integration
    // GitHub integration will be set up manually through the Amplify Console
    const amplifyApp = new amplify.App(this, 'TodoApp', {
      appName: `todo-app-${props.environment}`,
      environmentVariables: {
        ENVIRONMENT: props.environment,
        DYNAMODB_TABLE: todoTable.tableName,
        ASSETS_BUCKET: assetsBucket.bucketName,
        ...(repoOwner && { GITHUB_OWNER: repoOwner }),
        ...(repoName && { GITHUB_REPO: repoName }),
        ...(branch && { GITHUB_BRANCH: branch }),
      },
      // Add GitHub source code provider if repository URL is provided
      sourceCodeProvider: (() => {
        // Only attempt to use GitHub source code provider if we have all required information
        if (props.repositoryUrl && repoOwner && repoName) {
          try {
            return new amplify.GitHubSourceCodeProvider({
              owner: repoOwner,
              repository: repoName,
              oauthToken: cdk.SecretValue.secretsManager('github-token', {
                jsonField: 'token',
              }),
            });
          } catch (error) {
            // Log the error but continue without GitHub integration
            console.log(
              `Failed to create GitHub source code provider: ${error instanceof Error ? error.message : String(error)}`
            );
            console.log(
              'Continuing without GitHub integration. You can connect your repository manually through the Amplify Console.'
            );
            return undefined;
          }
        }
        return undefined;
      })(),
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        frontend: {
          phases: {
            preBuild: {
              commands: ['npm ci'],
            },
            build: {
              commands: ['npm run build'],
            },
          },
          artifacts: {
            baseDirectory: '.next',
            files: ['**/*'],
          },
          cache: {
            paths: ['node_modules/**/*'],
          },
        },
      }),
      customRules: [
        {
          source: '/<*>',
          target: '/index.html',
          status: amplify.RedirectStatus.NOT_FOUND_REWRITE,
        },
        {
          source: '/api/<*>',
          target: '/api/index.html',
          status: amplify.RedirectStatus.REWRITE,
        },
      ],
    });

    // Configure auto branch creation using the CfnApp class
    const cfnApp = amplifyApp.node.defaultChild as cdk.aws_amplify.CfnApp;
    cfnApp.autoBranchCreationConfig = {
      enableAutoBuild: true,
      enablePullRequestPreview: props.environment !== 'prod',
      autoBranchCreationPatterns: [branch, 'dev', 'feature/*', 'release/*'],
      stage: props.environment === 'prod' ? 'PRODUCTION' : 'DEVELOPMENT',
    };
    cfnApp.enableBranchAutoDeletion = true;

    // Add a branch to the Amplify app
    // This branch will be connected to GitHub manually through the Amplify Console
    const amplifyBranch = new amplify.Branch(this, 'Branch', {
      app: amplifyApp,
      branchName: branch,
      stage: props.environment === 'prod' ? 'PRODUCTION' : 'DEVELOPMENT',
      autoBuild: true,
      pullRequestPreview: props.environment !== 'prod',
    });

    // Create an IAM role for the Amplify app to access DynamoDB and S3
    const amplifyRole = new iam.Role(this, 'AmplifyRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
      description: `Role for Amplify app to access resources in ${props.environment}`,
    });

    // Grant the Amplify app access to DynamoDB
    todoTable.grantReadWriteData(amplifyRole);

    // Grant the Amplify app access to S3
    assetsBucket.grantReadWrite(amplifyRole);

    // Set the IAM role on the Amplify app
    amplifyApp.addCustomRule({
      source: '/api/<*>',
      target: '/api/index.html',
      status: amplify.RedirectStatus.REWRITE,
    });

    // Create a CloudWatch dashboard for monitoring
    const dashboard = new cloudwatch.Dashboard(this, 'TodoDashboard', {
      dashboardName: `${props.environment}-todo-dashboard`,
    });

    // Add DynamoDB metrics to the dashboard
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'DynamoDB Read Capacity',
        left: [todoTable.metricConsumedReadCapacityUnits()],
      }),
      new cloudwatch.GraphWidget({
        title: 'DynamoDB Write Capacity',
        left: [todoTable.metricConsumedWriteCapacityUnits()],
      }),
      new cloudwatch.GraphWidget({
        title: 'DynamoDB Throttled Requests',
        left: [
          todoTable.metricThrottledRequestsForOperation('GetItem'),
          todoTable.metricThrottledRequestsForOperation('PutItem'),
          todoTable.metricThrottledRequestsForOperation('Query'),
          todoTable.metricThrottledRequestsForOperation('Scan'),
        ],
      })
    );

    // Create CloudWatch alarms for DynamoDB throttled requests
    // Using simpler metrics to avoid exceeding the 10 metrics limit
    new cloudwatch.Alarm(this, 'GetItemThrottledAlarm', {
      metric: todoTable.metric('ThrottledRequests', {
        dimensionsMap: {
          Operation: 'GetItem',
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 10,
      evaluationPeriods: 2,
      alarmDescription: 'Alarm if GetItem throttled requests exceed 10 in 2 evaluation periods',
    });

    new cloudwatch.Alarm(this, 'PutItemThrottledAlarm', {
      metric: todoTable.metric('ThrottledRequests', {
        dimensionsMap: {
          Operation: 'PutItem',
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 10,
      evaluationPeriods: 2,
      alarmDescription: 'Alarm if PutItem throttled requests exceed 10 in 2 evaluation periods',
    });

    // Output the Amplify app ID and URL
    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: amplifyApp.appId,
      description: 'The ID of the Amplify app',
    });

    new cdk.CfnOutput(this, 'AmplifyAppURL', {
      value: `https://${branch}.${amplifyApp.appId}.amplifyapp.com`,
      description: 'The URL of the deployed Amplify app',
    });

    // Output the Amplify Console URL for connecting to GitHub
    new cdk.CfnOutput(this, 'AmplifyConsoleURL', {
      value: `https://${this.region}.console.aws.amazon.com/amplify/home?region=${this.region}#/${amplifyApp.appId}`,
      description: 'URL to the Amplify Console for connecting to GitHub',
    });

    // Output instructions for connecting to GitHub
    new cdk.CfnOutput(this, 'GitHubConnectionInstructions', {
      value: `
To connect this Amplify app to GitHub (if not already connected):
1. First, set up your GitHub token in AWS Secrets Manager:
   ./scripts/setup-github-token.sh [aws-profile] <github-token>

2. If you encounter an error about "manually deployed branch still exists", delete all branches:
   ./scripts/delete-amplify-branches.sh ${props.environment} [aws-profile]

3. Then, redeploy the infrastructure:
   ./scripts/deploy.sh ${props.environment} ${branch} [aws-profile]

4. If automatic connection fails, you can manually connect through the Amplify Console:
   ${`https://${this.region}.console.aws.amazon.com/amplify/home?region=${this.region}#/${amplifyApp.appId}`}
   - Click on "Connect branch"
   - Choose GitHub as the repository provider
   - Authorize AWS Amplify to access your GitHub account
   - Select your repository (${repoOwner || 'owner'}/${repoName || 'repo'}) and branch (${branch})
   - Click "Connect branch"

5. If all else fails, you can delete the Amplify app and start fresh:
   ./scripts/delete-amplify-app.sh ${props.environment} [aws-profile]
   Then redeploy the infrastructure.
`,
      description: 'Instructions for connecting to GitHub',
    });

    // Output the DynamoDB table name
    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: todoTable.tableName,
      description: 'The name of the DynamoDB table',
    });

    // Output the S3 bucket name
    new cdk.CfnOutput(this, 'S3BucketName', {
      value: assetsBucket.bucketName,
      description: 'The name of the S3 bucket for assets',
    });
  }
}
