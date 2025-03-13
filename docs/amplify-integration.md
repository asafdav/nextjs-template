# AWS Amplify Integration

This project is integrated with AWS Amplify to provide hosting and backend services.

## Setup

1. Install the AWS Amplify CLI globally:

   ```bash
   npm install -g @aws-amplify/cli
   ```

2. Configure AWS credentials following the instructions in [amplify-setup.md](./amplify-setup.md).

3. The project is already set up with the necessary Amplify configuration files:
   - `src/amplifyconfiguration.ts`: Contains the Amplify configuration
   - `src/utils/amplify.ts`: Initializes Amplify in the application
   - `amplify.yml`: Configures the build and deployment settings

## Deployment

To deploy the application to AWS Amplify:

1. Push your code to GitHub.

2. In the AWS Amplify Console:
   - Connect your GitHub repository
   - Follow the setup instructions
   - Amplify will automatically build and deploy your application

## Local Development

For local development with Amplify:

1. Make sure you have configured AWS credentials.

2. Start the development server:

   ```bash
   npm run dev
   ```

3. The application will use the Amplify configuration in `src/amplifyconfiguration.ts`.

## Adding Amplify Features

To add additional Amplify features (Auth, API, Storage, etc.):

1. Update the Amplify configuration in `src/amplifyconfiguration.ts`.

2. Install any necessary Amplify libraries:

   ```bash
   npm install aws-amplify-<feature>
   ```

3. Import and use the feature in your components:

   ```typescript
   import { Auth } from 'aws-amplify';

   // Use Auth API
   await Auth.signIn(username, password);
   ```

## CI/CD Integration

The project includes GitHub Actions workflow integration for Amplify deployment. See `.github/workflows/deploy.yml` for details.
