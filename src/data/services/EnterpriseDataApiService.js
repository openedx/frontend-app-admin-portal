import axios from 'axios';
import qs from 'query-string';

class EnterpriseDataApiService {
  // NOTE: This is pulling from a local instance of the edx-analytics-data-api (https://github.com/edx/edx-analytics-data-api).
  static baseUrl = 'http://localhost:8000/enterprise/api/v0/enterprise/';
  static jwtToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzY29wZXMiOiBbInJlYWQiLCAid3JpdGUiLCAicHJvZmlsZSIsICJlbWFpbCJdLCAiYWRtaW5pc3RyYXRvciI6IHRydWUsICJhdWQiOiAibG1zLWtleSIsICJmYW1pbHlfbmFtZSI6ICIiLCAiaXNzIjogImh0dHA6Ly9lZHguZGV2c3RhY2subG1zOjE4MDAwL29hdXRoMiIsICJmaWx0ZXJzIjogWyJ1c2VyOm1lIl0sICJwcmVmZXJyZWRfdXNlcm5hbWUiOiAiZWR4IiwgIm5hbWUiOiAiIiwgInZlcnNpb24iOiAiMS4xLjAiLCAiZ2l2ZW5fbmFtZSI6ICIiLCAiZXhwIjogMTUzMTc5MDkyNSwgImlhdCI6IDE1MzE3NTQ5MjUsICJpc19yZXN0cmljdGVkIjogZmFsc2UsICJlbWFpbCI6ICJlZHhAZXhhbXBsZS5jb20iLCAic3ViIjogImZjMmI3MjAxMTRiYjA3YjQ2NWU4NDNhNzRlYzY4M2U2In0.dKNmkOFii9XAmLlMx2lKZbzqs8I8rFz7XYpzxeWFRp8';

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
