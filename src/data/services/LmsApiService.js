import axios from 'axios';
import qs from 'query-string';

class LmsApiService {
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
        // TODO: JWT token currently hardcoded but will be replaced once
        // authentication is implemented.
        Authorization: 'JWT eyJhbGciOiJIUzI1NiJ9.eyJzY29wZXMiOiBbInJlYWQiLCAid3JpdGUiLCAicHJvZmlsZSIsICJlbWFpbCJdLCAiYWRtaW5pc3RyYXRvciI6IHRydWUsICJhdWQiOiAibG1zLWtleSIsICJmYW1pbHlfbmFtZSI6ICIiLCAiaXNzIjogImh0dHA6Ly9lZHguZGV2c3RhY2subG1zOjE4MDAwL29hdXRoMiIsICJwcmVmZXJyZWRfdXNlcm5hbWUiOiAiZWR4IiwgIm5hbWUiOiAiIiwgImdpdmVuX25hbWUiOiAiIiwgImV4cCI6IDE1MjkzODAyNTEsICJpYXQiOiAxNTI5MzQ0MjUxLCAiZW1haWwiOiAiZWR4QGV4YW1wbGUuY29tIiwgInN1YiI6ICJmYzJiNzIwMTE0YmIwN2I0NjVlODQzYTc0ZWM2ODNlNiJ9.HUWzNOH0An8fqfULKv2x6c8cm2EWNt3pel9vux5uzf8',
      },
    });
  }
}

export default LmsApiService;
