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

## Deployment

This project is configured for deployment to AWS Amplify.

### AWS Amplify Deployment

1. **Prerequisites**:

   - AWS account with appropriate permissions
   - AWS Amplify CLI installed and configured

2. **Deployment Steps**:
   - Connect your GitHub repository to AWS Amplify Console
   - Configure build settings using the provided `amplify.yml` file
   - Set up environment variables if needed
   - Deploy the application

For detailed deployment instructions, see [docs/amplify-deployment.md](docs/amplify-deployment.md).

### Continuous Deployment

The project includes GitHub Actions workflows for continuous integration and deployment:

- **CI Workflow**: Runs on pull requests to validate code quality and tests
- **Deployment Workflow**: Deploys to AWS Amplify when changes are merged to the main branch
  - Automatically builds and tests the application
  - Deploys preview environments for pull requests
  - Comments on PRs with preview deployment links
  - Deploys to production when merged to main

For detailed deployment instructions and GitHub Actions setup, see [docs/amplify-deployment.md](docs/amplify-deployment.md).

## Documentation

Additional documentation is available in the `docs` directory:

- [Amplify Setup](docs/amplify-setup.md): Instructions for setting up AWS Amplify CLI
- [Amplify Integration](docs/amplify-integration.md): Details about the Amplify integration
- [Amplify Deployment](docs/amplify-deployment.md): Step-by-step deployment guide

## License

This project is licensed under the MIT License - see the LICENSE file for details.