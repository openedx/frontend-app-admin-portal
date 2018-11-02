import qs from 'query-string';

const hasFeatureFlagEnabled = (featureFlag) => { // eslint-disable-line no-unused-vars
  const { features } = qs.parse(window.location.search);
  return features && features.split(',').includes(featureFlag);
};

const configuration = {
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  DATA_API_BASE_URL: process.env.DATA_API_BASE_URL,
  LMS_CLIENT_ID: process.env.LMS_CLIENT_ID,
  SECURE_COOKIES: process.env.NODE_ENV !== 'development',
  SEGMENT_KEY: process.env.SEGMENT_KEY,
};

const features = {};

export { configuration, features };
