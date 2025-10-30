import Constants from 'expo-constants';

/**
 * Environment configuration for the mobile app
 * This can be configured in app.json under "extra" or via environment variables
 */
export const env = {
    API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000/api',
};

export default env;
