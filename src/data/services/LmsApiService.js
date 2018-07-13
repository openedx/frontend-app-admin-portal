import axios from 'axios';
import qs from 'query-string';

class LmsApiService {
  // TODO: JWT token currently hardcoded but will be replaced
  // once authentication is implemented.
  static jwtToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzY29wZXMiOiBbInJlYWQiLCAid3JpdGUiLCAicHJvZmlsZSIsICJlbWFpbCJdLCAiYWRtaW5pc3RyYXRvciI6IHRydWUsICJhdWQiOiAibG1zLWtleSIsICJmYW1pbHlfbmFtZSI6ICIiLCAiaXNzIjogImh0dHA6Ly9lZHguZGV2c3RhY2subG1zOjE4MDAwL29hdXRoMiIsICJmaWx0ZXJzIjogWyJ1c2VyOm1lIl0sICJwcmVmZXJyZWRfdXNlcm5hbWUiOiAiZWR4IiwgIm5hbWUiOiAiIiwgInZlcnNpb24iOiAiMS4xLjAiLCAiZ2l2ZW5fbmFtZSI6ICIiLCAiZXhwIjogMTUzMTc5MDkyNSwgImlhdCI6IDE1MzE3NTQ5MjUsICJpc19yZXN0cmljdGVkIjogZmFsc2UsICJlbWFpbCI6ICJlZHhAZXhhbXBsZS5jb20iLCAic3ViIjogImZjMmI3MjAxMTRiYjA3YjQ2NWU4NDNhNzRlYzY4M2U2In0.dKNmkOFii9XAmLlMx2lKZbzqs8I8rFz7XYpzxeWFRp8';

  static fetchCourseOutline(courseId) {
    const options = {
      course_id: courseId,
      username: 'staff',
      depth: 'all',
      nav_depth: 3,
      block_types_filter: 'course,chapter,sequential,vertical',
    };
    const outlineUrl = `http://localhost:18000/api/courses/v1/blocks/?${qs.stringify(options)}`;
    return axios.get(outlineUrl, {
      withCredentials: true,
      headers: {
        Authorization: `JWT ${this.jwtToken}`,
      },
    });
  }

  static fetchPortalConfiguration(enterpriseSlug) {
    // TODO: This should pull from LMS
    const portalConfigurationUrl = `http://localhost:18000/enterprise/api/v1/enterprise-customer-branding/${enterpriseSlug}/`;
    return axios.get(portalConfigurationUrl, {
      withCredentials: true,
      headers: {
        Authorization: `JWT ${this.jwtToken}`,
      },
    });
  }
}

export default LmsApiService;
