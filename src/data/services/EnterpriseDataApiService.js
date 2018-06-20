import axios from 'axios';
import qs from 'query-string';

class EnterpriseDataApiService {
  // NOTE: This is pulling from a local instance of the edx-analytics-data-api (https://github.com/edx/edx-analytics-data-api).
  static baseUrl = 'http://localhost:8000/enterprise/api/v0/enterprise/';
  static jwtToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzY29wZXMiOiBbInJlYWQiLCAid3JpdGUiLCAicHJvZmlsZSIsICJlbWFpbCJdLCAiYWRtaW5pc3RyYXRvciI6IHRydWUsICJhdWQiOiAibG1zLWtleSIsICJmYW1pbHlfbmFtZSI6ICIiLCAiaXNzIjogImh0dHA6Ly9lZHguZGV2c3RhY2subG1zOjE4MDAwL29hdXRoMiIsICJwcmVmZXJyZWRfdXNlcm5hbWUiOiAiZWR4IiwgIm5hbWUiOiAiIiwgImdpdmVuX25hbWUiOiAiIiwgImV4cCI6IDE1MzAxNDIyNjcsICJpYXQiOiAxNTMwMTA2MjY3LCAiZW1haWwiOiAiZWR4QGV4YW1wbGUuY29tIiwgInN1YiI6ICJmYzJiNzIwMTE0YmIwN2I0NjVlODQzYTc0ZWM2ODNlNiJ9.mM94I9Yev3TIVj6secTpWlrqaKwaZJgyFk1EhQUuWxk';

  static fetchCourseEnrollments(enterpriseId, options) {
    const queryParams = {
      page: 1,
      page_size: 25,
      ...options,
    };
    let enrollmentsUrl = `${this.baseUrl}${enterpriseId}/enrollments/`;

    if (options && typeof options === 'object') {
      enrollmentsUrl += `?${qs.stringify(queryParams)}`;
    }

    return axios.get(enrollmentsUrl, {
      withCredentials: true,
      headers: {
        Authorization: `JWT ${this.jwtToken}`,
      },
    });
  }

  static fetchDashboardAnalytics(enterpriseId) {
    const analyticsUrl = `${this.baseUrl}${enterpriseId}/enrollments/overview/`;
    return axios.get(analyticsUrl, {
      withCredentials: true,
      headers: {
        Authorization: `JWT ${this.jwtToken}`,
      },
    });
  }
}

export default EnterpriseDataApiService;
