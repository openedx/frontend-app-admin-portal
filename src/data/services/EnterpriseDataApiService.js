import axios from 'axios';
import qs from 'query-string';
import config from '../../config';

class EnterpriseDataApiService {
  // TODO: This should access the data-api through the gateway instead of direct
  static enterpiseBaseUrl = `${config.DATA_API_BASE_URL}/enterprise/api/v0/enterprise/`;
  static jwtToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzY29wZXMiOiBbInJlYWQiLCAid3JpdGUiLCAicHJvZmlsZSIsICJlbWFpbCJdLCAiYWRtaW5pc3RyYXRvciI6IHRydWUsICJhdWQiOiAibG1zLWtleSIsICJmYW1pbHlfbmFtZSI6ICIiLCAiaXNzIjogImh0dHA6Ly9lZHguZGV2c3RhY2subG1zOjE4MDAwL29hdXRoMiIsICJmaWx0ZXJzIjogWyJ1c2VyOm1lIl0sICJwcmVmZXJyZWRfdXNlcm5hbWUiOiAiZWR4IiwgIm5hbWUiOiAiIiwgInZlcnNpb24iOiAiMS4xLjAiLCAiZ2l2ZW5fbmFtZSI6ICIiLCAiZXhwIjogMTUzMjAzNjA0NCwgImlhdCI6IDE1MzIwMDAwNDQsICJpc19yZXN0cmljdGVkIjogZmFsc2UsICJlbWFpbCI6ICJlZHhAZXhhbXBsZS5jb20iLCAic3ViIjogImZjMmI3MjAxMTRiYjA3YjQ2NWU4NDNhNzRlYzY4M2U2In0.vR-rzXqZtOOddfVQ3U7_3pDjjWP1tFA41mEnTSthirg';

  static fetchCourseEnrollments(enterpriseId, options) {
    const queryParams = {
      page: 1,
      page_size: 50,
      ...options,
    };
    let enrollmentsUrl = `${this.enterpiseBaseUrl}${enterpriseId}/enrollments/`;

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
    const analyticsUrl = `${this.enterpiseBaseUrl}${enterpriseId}/enrollments/overview/`;
    return axios.get(analyticsUrl, {
      withCredentials: true,
      headers: {
        Authorization: `JWT ${this.jwtToken}`,
      },
    });
  }
}

export default EnterpriseDataApiService;
