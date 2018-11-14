import { getAuthenticatedAPIClient } from '@edx/frontend-auth';

const apiClient = getAuthenticatedAPIClient({
  appBaseUrl: process.env.BASE_URL,
  loginUrl: process.env.LOGIN_URL,
  logoutUrl: process.env.LOGOUT_URL,
  refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
  userInfoCookieName: process.env.USER_INFO_COOKIE_NAME,
});

export default apiClient;
