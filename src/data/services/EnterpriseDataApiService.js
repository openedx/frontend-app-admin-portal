import qs from 'query-string';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { configuration } from '../../config';

class EnterpriseDataApiService {
  // TODO: This should access the data-api through the gateway instead of direct
  static apiClient = getAuthenticatedHttpClient;

  static enterpriseBaseUrl = `${configuration.DATA_API_BASE_URL}/enterprise/api/v1/enterprise/`;

  static fetchDashboardAnalytics(enterpriseId) {
    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/enrollments/overview/`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchCourseEnrollments(enterpriseId, options, { csv } = {}) {
    const endpoint = csv ? 'enrollments.csv' : 'enrollments';
    const queryParams = {
      page: 1,
      page_size: 50,
      no_page: csv,
      ...options,
    };

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/${endpoint}/?${qs.stringify(queryParams)}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchUnenrolledRegisteredLearners(enterpriseId, options, { csv } = {}) {
    const endpoint = csv ? 'users.csv' : 'users';
    const queryParams = {
      page: 1,
      page_size: 50,
      has_enrollments: false,
      no_page: csv,
      ...options,
    };

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/${endpoint}/?${qs.stringify(queryParams)}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchEnrolledLearners(enterpriseId, options, { csv } = {}) {
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
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchEnrolledLearnersForInactiveCourses(enterpriseId, options, { csv } = {}) {
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
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchCompletedLearners(enterpriseId, options, { csv } = {}) {
    const endpoint = csv ? 'learner_completed_courses.csv' : 'learner_completed_courses';
    const queryParams = {
      page: 1,
      page_size: 50,
      no_page: csv,
      ...options,
    };

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/${endpoint}/?${qs.stringify(queryParams)}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }
}

export default EnterpriseDataApiService;
