# Todo App Architecture

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           AWS Cloud                                     │
│                                                                         │
│  ┌───────────────┐       ┌───────────────┐       ┌───────────────┐     │
│  │               │       │               │       │               │     │
│  │  GitHub Repo  │       │  AWS Amplify  │       │  API Routes   │     │
│  │               │◄─────►│  (NextJS App) │◄─────►│  (NextJS)     │     │
│  │               │       │               │       │               │     │
│  └───────────────┘       └───────────────┘       └───────┬───────┘     │
│                                                          │             │
│                                                          ▼             │
│                                                  ┌───────────────┐     │
│                                                  │               │     │
│                                                  │  DynamoDB     │     │
│                                                  │  (Todo Table) │     │
│                                                  │               │     │
│                                                  └───────────────┘     │
│                                                                        │
│  ┌───────────────┐       ┌───────────────┐       ┌───────────────┐    │
│  │               │       │               │       │               │    │
│  │  CloudWatch   │       │  IAM Roles    │       │  S3 Bucket    │    │
│  │  (Monitoring) │       │  & Policies   │       │  (Assets)     │    │
│  │               │       │               │       │               │    │
│  └───────────────┘       └───────────────┘       └───────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Component Description

### AWS Amplify

- Hosts the NextJS application
- Provides CI/CD capabilities
- Connects to GitHub repository for automatic deployments
- Manages environment variables for different environments

### DynamoDB

- Stores Todo items
- Provides fast, consistent performance
- Uses a global secondary index for querying by completion status
- Scales automatically based on demand

### S3 Bucket

- Stores static assets for the application
- Provides secure, durable storage
- Configured with appropriate lifecycle policies

### IAM Roles & Policies

- Implements least privilege access
- Secures access to AWS resources
- Provides role-based access control

### CloudWatch

- Monitors application performance
- Provides dashboards for visibility
- Sets up alarms for critical metrics
- Logs application events

## Environment Separation

The infrastructure is deployed to three separate environments:

1. **Development (dev)**

   - Used for development and testing
   - Connected to the `dev` branch
   - Allows for quick iteration and testing

2. **Staging**

   - Pre-production environment
   - Connected to the `staging` branch
   - Used for final testing before production

3. **Production**
   - Production environment
   - Connected to the `main` branch
   - Optimized for performance and reliability
   - Enhanced security and monitoring

Each environment has its own isolated resources to prevent cross-environment impacts.
