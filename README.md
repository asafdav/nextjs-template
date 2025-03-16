# NextJS Template

A modern NextJS application template with TypeScript, ESLint, Prettier, and Jest.

## Features

- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Type-safe JavaScript
- **ESLint**: Code quality tool
- **Prettier**: Code formatting tool
- **Jest & React Testing Library**: Testing framework
- **Tailwind CSS**: Utility-first CSS framework
- **GitHub Actions**: Continuous Integration and Deployment
- **AWS Amplify**: Hosting and deployment platform
- **Local Storage**: Data persistence across browser sessions
- **Cross-Tab Sync**: Synchronization of data across browser tabs
- **Auto branch detection**: Feature branches
- **DynamoDB**: Data storage

## Project Structure

```
nextjs-template/
├── public/             # Static assets
├── src/
│   ├── app/            # App router pages and API routes
│   │   └── api/        # API routes for data handling
│   ├── components/     # Reusable UI components
│   │   └── Todo/       # Todo application components
│   ├── services/       # Service modules for API interaction
│   ├── styles/         # CSS and styling files
│   ├── tests/          # Test files
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions and services
├── docs/               # Documentation files
├── .github/            # GitHub Actions workflows
├── amplify.yml         # AWS Amplify build configuration
├── .eslintrc.js        # ESLint configuration
├── .prettierrc         # Prettier configuration
├── jest.config.mjs     # Jest configuration
└── tsconfig.json       # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/nextjs-template.git
cd nextjs-template
```

2. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate test coverage:

```bash
npm run test:coverage
```

### Linting and Formatting

Lint code:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

### Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Deployment with AWS Amplify

This project uses AWS Amplify for deployment, with a team-friendly approach that leverages AWS Amplify's direct GitHub integration.

### Prerequisites

- AWS account with appropriate permissions
- AWS CLI configured with a profile that has necessary permissions
- Git repository cloned locally
- GitHub repository with admin access

### Deploying the Infrastructure

#### Step 1: Configure AWS Environment (One-time Setup)

First, configure your AWS environment:

```bash
cd infrastructure
./scripts/configure-aws.sh [aws-profile]
```

Arguments:

- `aws-profile`: AWS profile to use. Default: default

Examples:

```bash
./scripts/configure-aws.sh my-profile
```

After running this script:

1. Source the environment variables: `source .env` or `source load-env.sh`
2. The script will also offer to bootstrap your AWS environment for CDK if needed

#### Step 2: Deploy the Infrastructure

After configuring AWS, deploy the infrastructure:

```bash
./scripts/deploy.sh [environment] [branch] [aws-profile]
```

Arguments:

- `environment`: Environment to deploy (dev, staging, production). Default: dev
- `branch`: Git branch to deploy. Default: same as environment
- `aws-profile`: AWS profile to use. Default: default

Examples:

```bash
./scripts/deploy.sh dev main my-profile
```

The script will:

1. Load environment variables
2. Validate your AWS credentials
3. Install dependencies and build the CDK app
4. Deploy the infrastructure with the appropriate settings
5. Provide instructions for connecting to GitHub

#### Step 3: Connect to GitHub

After deployment, you'll need to connect your Amplify app to GitHub:

1. Find the Amplify Console URL in the deployment output
2. Go to the Amplify Console and click "Connect branch"
3. Choose GitHub as the repository provider
4. Authorize AWS Amplify to access your GitHub account
5. Select your repository and branch
6. Click "Connect branch"

After connecting your repository, Amplify will automatically build and deploy your application.

### How the GitHub Integration Works

AWS Amplify's GitHub integration:

1. **Uses OAuth Authentication**: Securely connects to GitHub without personal access tokens
2. **Automatic Deployments**: Automatically builds and deploys when changes are pushed to the connected branch
3. **Pull Request Previews**: Optionally creates preview environments for pull requests
4. **Branch-based Environments**: Supports multiple environments based on different branches

### Benefits of This Approach

- **Simple Setup**: Easy to configure through the Amplify Console UI
- **No Personal Tokens**: Uses OAuth for secure authentication
- **Team-Friendly**: Works with organizational repositories
- **Secure**: Follows AWS security best practices
- **Scalable**: Can be used across multiple projects and teams
- **Maintainable**: Easy to manage and update as your team and project evolve

### Accessing Your Application

Once deployment and GitHub connection are complete, you can access your application at the URL provided in the Amplify Console. The URL will be in the format:

```
https://branch-name.app-id.amplifyapp.com
```

This URL is also provided in the CloudFormation outputs after deployment.

## Documentation

Additional documentation is available in the `docs`

## Configuration

This project uses a single Next.js configuration file (`next.config.js`) optimized for static site generation with AWS Amplify hosting.

Key configuration features:
- Static export with `output: 'export'`
- Trailing slashes for better compatibility with Amplify hosting
- Unoptimized images (required for static export)
- Environment variables for both development and production
