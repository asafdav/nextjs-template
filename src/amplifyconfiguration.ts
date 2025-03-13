// Amplify configuration for the project
const amplifyConfig = {
  aws_project_region: 'us-east-1',
  aws_cognito_identity_pool_id: 'PLACEHOLDER_IDENTITY_POOL_ID',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'PLACEHOLDER_USER_POOL_ID',
  aws_user_pools_web_client_id: 'PLACEHOLDER_USER_POOL_CLIENT_ID',
  oauth: {},
  aws_cloud_logic_custom: [
    {
      name: 'api',
      endpoint: 'PLACEHOLDER_API_ENDPOINT',
      region: 'us-east-1',
    },
  ],
  aws_appsync_graphqlEndpoint: 'PLACEHOLDER_APPSYNC_ENDPOINT',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'PLACEHOLDER_APPSYNC_API_KEY',
};

export default amplifyConfig;
