import axios from 'axios';
import qs from 'query-string';
import config from '../../config';
import { getAccessToken } from '../../utils';

class EnterpriseDataApiService {
  // TODO: This should access the data-api through the gateway instead of direct
  static enterpiseBaseUrl = `${config.DATA_API_BASE_URL}/enterprise/api/v0/enterprise/`;

  static fetchCourseEnrollments(enterpriseId, options) {
    const queryParams = {
      page: 1,
      page_size: 50,
      ...options,
    };
    let enrollmentsUrl = `${this.enterpiseBaseUrl}${enterpriseId}/enrollments/`;
    const jwtToken = getAccessToken();

    if (options && typeof options === 'object') {
      enrollmentsUrl += `?${qs.stringify(queryParams)}`;
    }

    return axios.get(enrollmentsUrl, {
      withCredentials: true,
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchDashboardAnalytics(enterpriseId) {
    const analyticsUrl = `${this.enterpiseBaseUrl}${enterpriseId}/enrollments/overview/`;
    const jwtToken = getAccessToken();

    return axios.get(analyticsUrl, {
      withCredentials: true,
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }
}

export default EnterpriseDataApiService;
