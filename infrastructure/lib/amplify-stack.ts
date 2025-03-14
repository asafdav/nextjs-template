import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

export interface AmplifyStackProps extends cdk.StackProps {
  environment: string;
  repositoryUrl: string;
  branch: string;
  todoTable: dynamodb.Table;
  assetsBucket: s3.Bucket;
}

export class AmplifyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AmplifyStackProps) {
    super(scope, id, props);

    // Extract repository information from the URL
    const repoUrlParts = props.repositoryUrl.split('/');
    const repoOwner = repoUrlParts[3] || '';
    const repoName = repoUrlParts[4]?.replace('.git', '') || '';

    // Create Amplify app without source code provider initially
    // We'll provide instructions for connecting via the AWS Console
    const amplifyApp = new amplify.App(this, 'TodoApp', {
      appName: `todo-app-${props.environment}`,
      environmentVariables: {
        ENVIRONMENT: props.environment,
        REGION: this.region,
        TODO_TABLE_NAME: props.todoTable.tableName,
        ASSETS_BUCKET_NAME: props.assetsBucket.bucketName,
      },
      customRules: [
        {
          source: '/<*>',
          target: '/index.html',
          status: amplify.RedirectStatus.NOT_FOUND_REWRITE,
        },
      ],
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
            paths: ['node_modules/**/*', '.next/cache/**/*'],
          },
        },
      }),
    });

    // Add branch configuration
    const branch = amplifyApp.addBranch(props.branch, {
      stage: props.environment === 'production' ? 'PRODUCTION' : 'DEVELOPMENT',
      autoBuild: true,
      pullRequestPreview: props.environment !== 'production',
    });

    // Create IAM role for Amplify to access DynamoDB and S3
    const amplifyRole = new iam.Role(this, 'AmplifyRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
      description: 'Role for Amplify to access DynamoDB and S3',
    });

    // Grant permissions to DynamoDB table
    props.todoTable.grantReadWriteData(amplifyRole);

    // Grant permissions to S3 bucket
    props.assetsBucket.grantReadWrite(amplifyRole);

    // Attach the role to the Amplify app
    amplifyApp.addCustomRule({
      source: '/api/<*>',
      target: '/api/$1',
      status: amplify.RedirectStatus.REWRITE,
    });

    // Output the Amplify app ID and URL
    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: amplifyApp.appId,
      description: 'ID of the Amplify app',
    });

    new cdk.CfnOutput(this, 'AmplifyConsoleUrl', {
      value: `https://${this.region}.console.aws.amazon.com/amplify/home?region=${this.region}#/${amplifyApp.appId}`,
      description: 'URL to the Amplify Console',
    });

    // Output instructions for connecting to GitHub using AWS CodeStar connections
    new cdk.CfnOutput(this, 'GitHubConnectionInstructions', {
      value: [
        `To connect this app to GitHub using AWS CodeStar connections:`,
        `1. Go to the AWS Console > Developer Tools > Settings > Connections`,
        `2. Click "Create connection" and select GitHub`,
        `3. Follow the prompts to authorize AWS to access your GitHub organization`,
        `4. Once created, go to the Amplify Console at the URL above`,
        `5. Select the app and click "Connect repository"`,
        `6. Choose "GitHub" and select the CodeStar connection you created`,
        `7. Select the repository "${repoOwner}/${repoName}" and branch "${props.branch}"`,
      ].join('\n'),
      description: 'Instructions for connecting to GitHub using AWS CodeStar connections',
    });
  }
}
