import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { configuration } from '../../../config';

class AnalyticsApiService {
  static lmsBaseUrl = configuration.LMS_BASE_URL;

  static tableauTokenUrl = `${AnalyticsApiService.lmsBaseUrl}/enterprise/api/v1/tableau_token`;

  static fetchTableauToken(options) {
    // eslint-disable-next-line no-unused-vars
    const queryParams = {
      ...options,
    };
    return getAuthenticatedHttpClient().get(AnalyticsApiService.tableauTokenUrl);
  }
}

export default AnalyticsApiService;
