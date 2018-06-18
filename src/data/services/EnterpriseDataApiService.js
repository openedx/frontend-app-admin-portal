import axios from 'axios';
import qs from 'query-string';

class EnterpriseDataApiService {
  static fetchCourseEnrollments(enterpriseId, options) {
    const queryParams = {
      page: 1,
      page_size: 25,
      ...options,
    };
    // NOTE: This is pulling from a local instance of the edx-analytics-data-api (https://github.com/edx/edx-analytics-data-api).
    let enrollmentsUrl = `http://localhost:8000/enterprise/api/v0/enterprise/${enterpriseId}/enrollments/`;
    if (options && typeof options === 'object') {
      enrollmentsUrl += `?${qs.stringify(queryParams)}`;
    }

    return axios.get(enrollmentsUrl, {
      withCredentials: true,
      headers: {
        // TODO: JWT token currently hardcoded but will be replaced once
        // authentication is implemented.
        Authorization: 'JWT eyJhbGciOiJIUzI1NiJ9.eyJzY29wZXMiOiBbInJlYWQiLCAid3JpdGUiLCAicHJvZmlsZSIsICJlbWFpbCJdLCAiYWRtaW5pc3RyYXRvciI6IHRydWUsICJhdWQiOiAibG1zLWtleSIsICJmYW1pbHlfbmFtZSI6ICIiLCAiaXNzIjogImh0dHA6Ly9lZHguZGV2c3RhY2subG1zOjE4MDAwL29hdXRoMiIsICJwcmVmZXJyZWRfdXNlcm5hbWUiOiAiZWR4IiwgIm5hbWUiOiAiIiwgImdpdmVuX25hbWUiOiAiIiwgImV4cCI6IDE1Mjk0NTM4MDAsICJpYXQiOiAxNTI5NDE3ODAwLCAiZW1haWwiOiAiZWR4QGV4YW1wbGUuY29tIiwgInN1YiI6ICJmYzJiNzIwMTE0YmIwN2I0NjVlODQzYTc0ZWM2ODNlNiJ9.aE_DCrxMBs_Khdk2ihAG8BlAi-s5wEsI-aFu1POS7uQ',
      },
    });
  }
}

export default EnterpriseDataApiService;
