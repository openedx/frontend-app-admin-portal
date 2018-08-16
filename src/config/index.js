export default {
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  DATA_API_BASE_URL: process.env.DATA_API_BASE_URL,
  LMS_CLIENT_ID: process.env.LMS_CLIENT_ID,
  SECURE_COOKIES: process.env.NODE_ENV !== 'development',
  SEGMENT_KEY: process.env.SEGMENT_KEY,
  NEW_RELIC_APP_ID: process.env.NEW_RELIC_APP_ID,
  NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
};
