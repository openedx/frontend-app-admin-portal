import qs from 'query-string';

import configuration from '../../config';
import httpClient from '../../httpClient';
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

    const outlineUrl = `${LmsApiService.baseUrl}/api/courses/v1/blocks/?${qs.stringify(options)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(outlineUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchPortalConfiguration(enterpriseSlug) {
    const portalConfigurationUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer-branding/${enterpriseSlug}/`;
    const jwtToken = getAccessToken();

    return httpClient.get(portalConfigurationUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchEnterpriseList(options) {
    const queryParams = {
      permissions: 'enterprise_data_api_access',
      page: 1,
      page_size: 50,
      ...options,
    };
    const enterpriseListUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer/with_access_to/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(enterpriseListUrl, {
      withCredentials: true,
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
      client_id: LmsApiService.clientId,
      token_type: 'jwt',
    };
    const authUrl = `${LmsApiService.baseUrl}/oauth2/access_token/`;
    return httpClient.post(authUrl, qs.stringify(loginData));
  }
}

export default LmsApiService;
