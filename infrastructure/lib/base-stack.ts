import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';

export interface BaseStackProps extends cdk.StackProps {
  environment: string;
}

export class BaseStack extends cdk.Stack {
  public readonly todoTable: dynamodb.Table;
  public readonly assetsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    // Create DynamoDB table for Todo items
    this.todoTable = new dynamodb.Table(this, 'TodoTable', {
      tableName: `${props.environment}-todo-table`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy:
        props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: props.environment === 'production',
      },
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // Add GSI for querying by completion status
    this.todoTable.addGlobalSecondaryIndex({
      indexName: 'CompletedIndex',
      partitionKey: { name: 'completed', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Create S3 bucket for static assets with a fixed name
    const bucketName = `${props.environment}-nextjs-assets-${this.account}-${this.region}`;
    this.assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: bucketName,
      removalPolicy:
        props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.environment !== 'production',
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: props.environment === 'production',
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
    });

    // Create CloudWatch dashboard for monitoring
    const dashboard = new cloudwatch.Dashboard(this, 'TodoAppDashboard', {
      dashboardName: `${props.environment}-todo-app-dashboard`,
    });

    // Add DynamoDB metrics to dashboard
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'DynamoDB Read/Write Capacity',
        left: [
          this.todoTable.metricConsumedReadCapacityUnits(),
          this.todoTable.metricConsumedWriteCapacityUnits(),
        ],
      }),
      new cloudwatch.GraphWidget({
        title: 'DynamoDB Throttled Requests',
        left: [
          // Use a simpler metric for the dashboard
          this.todoTable.metricThrottledRequestsForOperation('GetItem'),
          this.todoTable.metricThrottledRequestsForOperation('PutItem'),
        ],
      })
    );

    // Create CloudWatch alarms for specific operations instead of all operations
    new cloudwatch.Alarm(this, 'DynamoDBReadThrottledRequestsAlarm', {
      metric: this.todoTable.metricThrottledRequestsForOperation('GetItem'),
      threshold: 5,
      evaluationPeriods: 2,
      alarmDescription:
        'Alarm if DynamoDB GetItem throttled requests exceed 5 in 2 evaluation periods',
      actionsEnabled: props.environment === 'production',
    });

    new cloudwatch.Alarm(this, 'DynamoDBWriteThrottledRequestsAlarm', {
      metric: this.todoTable.metricThrottledRequestsForOperation('PutItem'),
      threshold: 5,
      evaluationPeriods: 2,
      alarmDescription:
        'Alarm if DynamoDB PutItem throttled requests exceed 5 in 2 evaluation periods',
      actionsEnabled: props.environment === 'production',
    });

    // Output the resource ARNs
    new cdk.CfnOutput(this, 'TodoTableArn', {
      value: this.todoTable.tableArn,
      description: 'ARN of the DynamoDB Todo table',
    });

    new cdk.CfnOutput(this, 'AssetsBucketArn', {
      value: this.assetsBucket.bucketArn,
      description: 'ARN of the S3 assets bucket',
    });
  }
}
