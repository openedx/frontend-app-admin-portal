import apiClient from '../../../data/apiClient';
import { configuration } from '../../../config';

class AnalyticsApiService {
  static lmsBaseUrl = configuration.LMS_BASE_URL;

  static tableauTokenUrl = `${AnalyticsApiService.lmsBaseUrl}/enterprise/api/v1/tableau_token`;

  static fetchTableauToken(options) {
    // eslint-disable-next-line no-unused-vars
    const queryParams = {
      ...options,
    };
    return apiClient.get(AnalyticsApiService.tableauTokenUrl);
  }
}

export default AnalyticsApiService;
