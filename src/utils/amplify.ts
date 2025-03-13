import { Amplify } from 'aws-amplify';
import amplifyConfig from '../amplifyconfiguration';

// Configure Amplify
export const configureAmplify = () => {
  Amplify.configure(amplifyConfig);
};

// Initialize Amplify configuration
if (typeof window !== 'undefined') {
  configureAmplify();
}
