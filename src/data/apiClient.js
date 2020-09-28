import {
  AxiosJwtAuthService,
  configure as configureAuth,
  getAuthenticatedHttpClient
} from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import {
  configure as configureLogging,
  getLoggingService,
  NewRelicLoggingService,
} from '@edx/frontend-platform/logging';
import { configure as configureAnalytics, SegmentAnalyticsService } from '@edx/frontend-platform/analytics';

configureLogging(NewRelicLoggingService, {
  config: getConfig(),
});

configureAuth(AxiosJwtAuthService, {
  loggingService: getLoggingService(),
  config: getConfig(),
});

configureAnalytics(SegmentAnalyticsService, {
  config: getConfig(),
  loggingService: getLoggingService(),
  httpClient: getAuthenticatedHttpClient(),
});


const apiClient = getAuthenticatedHttpClient();
// const apiClient = getAuthenticatedHttpClient({
//   appBaseUrl: process.env.BASE_URL,
//   authBaseUrl: process.env.LMS_BASE_URL,
//   loginUrl: process.env.LOGIN_URL,
//   logoutUrl: process.env.LOGOUT_URL,
//   csrfTokenApiPath: process.env.CSRF_TOKEN_API_PATH,
//   refreshAccessTokenEndpoint: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
//   accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME,
//   userInfoCookieName: process.env.USER_INFO_COOKIE_NAME,
//   loggingService: NewRelicLoggingService,
//   handleRefreshAccessTokenFailure: () => {},
// });

export default apiClient;
