# AWS Amplify Setup Instructions

## Configuring AWS Credentials

To configure AWS credentials for Amplify, follow these steps:

1. Run the following command:

   ```bash
   amplify configure
   ```

2. Sign in to the AWS Console if prompted.

3. Specify the AWS Region you want to use (e.g., `us-east-1`, `us-west-2`, etc.).

4. Create a new IAM user when prompted:

   - Specify a username (e.g., `amplify-nextjs-user`)
   - Open the AWS IAM console to create the user
   - Attach the `AdministratorAccess-Amplify` policy to the user
   - Complete the user creation process

5. Return to the terminal and enter the Access Key ID and Secret Access Key for the newly created user.

6. The configuration will be saved in your AWS credentials file.

## Verifying Configuration

To verify that your AWS credentials are configured correctly, you can run:

```bash
aws configure list
```

This should show your configured profile.

## Next Steps

After configuring AWS credentials, you can initialize Amplify in your project by running:

```bash
amplify init
```

Follow the prompts to set up your Amplify project.
