import qs from 'query-string';

import config from '../../config';
import httpClient from '../../httpClient';
import { getAccessToken } from '../../utils';

import store from '../store';

class EnterpriseDataApiService {
  // TODO: This should access the data-api through the gateway instead of direct
  static enterpriseBaseUrl = `${config.DATA_API_BASE_URL}/enterprise/api/v0/enterprise/`;

  static fetchCourseEnrollments(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const queryParams = {
      page: 1,
      page_size: 50,
      ...options,
    };

    const enrollmentsUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/enrollments/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(enrollmentsUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchCourseEnrollmentsCsv(enterpriseId) {
    const csvUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/enrollments.csv/?no_page=true`;
    const jwtToken = getAccessToken();
    return httpClient.get(csvUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchDashboardAnalytics(enterpriseId) {
    const analyticsUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/enrollments/overview/`;
    const jwtToken = getAccessToken();

    return httpClient.get(analyticsUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }
}

export default EnterpriseDataApiService;
