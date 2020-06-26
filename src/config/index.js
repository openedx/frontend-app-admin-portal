import qs from 'query-string';

const hasFeatureFlagEnabled = (featureFlag) => {
  const { features } = qs.parse(window.location.search);
  return features && features.split(',').includes(featureFlag);
};

const configuration = {
  BASE_URL: process.env.BASE_URL,
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  LOGIN_URL: process.env.LOGIN_URL,
  LOGOUT_URL: process.env.LOGOUT_URL,
  CSRF_TOKEN_API_PATH: process.env.CSRF_TOKEN_API_PATH,
  REFRESH_ACCESS_TOKEN_ENDPOINT: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  DATA_API_BASE_URL: process.env.DATA_API_BASE_URL,
  ECOMMERCE_BASE_URL: process.env.ECOMMERCE_BASE_URL,
  LICENSE_MANAGER_BASE_URL: process.env.LICENSE_MANAGER_BASE_URL,
  SECURE_COOKIES: process.env.NODE_ENV !== 'development',
  SEGMENT_KEY: process.env.SEGMENT_KEY,
  FULLSTORY_ORG_ID: process.env.FULLSTORY_ORG_ID,
  FULLSTORY_ENABLED: process.env.FULLSTORY_ENABLED,
  ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME,
  USER_INFO_COOKIE_NAME: process.env.USER_INFO_COOKIE_NAME,
  NODE_ENV: process.env.NODE_ENV,
  CUSTOMER_SUPPORT_EMAIL: 'customersuccess@edx.org',
};

const features = {
  CODE_MANAGEMENT: process.env.FEATURE_FLAGS.CODE_MANAGEMENT || hasFeatureFlagEnabled('CODE_MANAGEMENT'),
  REPORTING_CONFIGURATIONS: process.env.FEATURE_FLAGS.REPORTING_CONFIGURATIONS,
  SUBSCRIPTION_MANAGEMENT: process.env.FEATURE_FLAGS.SUBSCRIPTION_MANAGEMENT || hasFeatureFlagEnabled('SUBSCRIPTION_MANAGEMENT'),
  SUPPORT: process.env.FEATURE_FLAGS.SUPPORT || hasFeatureFlagEnabled('SUPPORT'),
};

export { configuration, features };
