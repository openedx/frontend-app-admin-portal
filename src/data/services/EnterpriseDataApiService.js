import qs from 'query-string';

import { configuration } from '../../config';
import httpClient from '../../httpClient';
import { getAccessToken } from '../../utils';

import store from '../store';

class EnterpriseDataApiService {
  // TODO: This should access the data-api through the gateway instead of direct
  static enterpriseBaseUrl = `${configuration.DATA_API_BASE_URL}/enterprise/api/v0/enterprise/`;

  static fetchDashboardAnalytics(enterpriseId) {
    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/enrollments/overview/`;
    const jwtToken = getAccessToken();

    return httpClient.get(url, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchCourseEnrollments(options, { csv } = {}) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const endpoint = csv ? 'enrollments.csv' : 'enrollments';
    const queryParams = {
      page: 1,
      page_size: 50,
      no_page: csv,
      ...options,
    };

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/${endpoint}/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(url, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchUnenrolledRegisteredLearners(options, { csv } = {}) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const endpoint = csv ? 'users.csv' : 'users';
    const queryParams = {
      page: 1,
      page_size: 50,
      has_enrollments: false,
      no_page: csv,
      ...options,
    };

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/${endpoint}/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(url, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchEnrolledLearners(options, { csv } = {}) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const endpoint = csv ? 'users.csv' : 'users';
    const queryParams = {
      page: 1,
      page_size: 50,
      has_enrollments: true,
      extra_fields: ['enrollment_count'],
      no_page: csv,
      ...options,
    };

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/${endpoint}/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(url, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchEnrolledLearnersForInactiveCourses(options, { csv } = {}) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const endpoint = csv ? 'users.csv' : 'users';
    const queryParams = {
      page: 1,
      page_size: 50,
      has_enrollments: true,
      active_courses: false,
      all_enrollments_passed: true,
      extra_fields: ['enrollment_count', 'course_completion_count'],
      no_page: csv,
      ...options,
    };

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/${endpoint}/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(url, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchCompletedLearners(options, { csv } = {}) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const endpoint = csv ? 'learner_completed_courses.csv' : 'learner_completed_courses';
    const queryParams = {
      page: 1,
      page_size: 50,
      no_page: csv,
      ...options,
    };

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/${endpoint}/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(url, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }
}

export default EnterpriseDataApiService;
