import axios from 'axios';
import qs from 'query-string';
import configuration from '../../config';
import { getAccessToken } from '../../utils';

class LmsApiService {
  static baseUrl = configuration.LMS_BASE_URL;
  static clientId = configuration.LMS_CLIENT_ID;

  static fetchCourseOutline(courseId) {
    const options = {
      course_id: courseId,
      username: 'staff',
      depth: 'all',
      nav_depth: 3,
      block_types_filter: 'course,chapter,sequential,vertical',
    };

    const outlineUrl = `${this.baseUrl}/api/courses/v1/blocks/?${qs.stringify(options)}`;
    const jwtToken = getAccessToken();

    return axios.get(outlineUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchPortalConfiguration(enterpriseSlug) {
    const portalConfigurationUrl = `${this.baseUrl}/enterprise/api/v1/enterprise-customer-branding/${enterpriseSlug}/`;
    const jwtToken = getAccessToken();

    return axios.get(portalConfigurationUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static authenticate(email, password) {
    const loginData = {
      grant_type: 'password',
      username: email,
      password,
      client_id: this.clientId,
      token_type: 'jwt',
    };
    const authUrl = `${this.baseUrl}/oauth2/access_token`;
    return axios.post(authUrl, qs.stringify(loginData));
  }
}

export default LmsApiService;
