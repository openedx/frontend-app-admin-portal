import qs from 'query-string';

import { configuration } from '../../config';
import httpClient from '../../httpClient';
import { getAccessToken } from '../../utils';

import store from '../store';

class EnterpriseDataApiService {
  // TODO: This should access the data-api through the gateway instead of direct
  static enterpriseBaseUrl = `${configuration.DATA_API_BASE_URL}/enterprise/api/v0/enterprise/`;

  static fetchCourseEnrollments(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const queryParams = {
      page: 1,
      page_size: 50,
      ...options,
    };

    const enrollmentsUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/enrollments/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(enrollmentsUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchCourseEnrollmentsCsv(enterpriseId) {
    const csvUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/enrollments.csv/?no_page=true`;
    const jwtToken = getAccessToken();
    return httpClient.get(csvUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchDashboardAnalytics(enterpriseId) {
    const analyticsUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/enrollments/overview/`;
    const jwtToken = getAccessToken();

    return httpClient.get(analyticsUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchUnerolledRegisteredLearners(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const queryParams = {
      page: 1,
      page_size: 50,
      has_enrollments: false,
      ...options,
    };

    const analyticsUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/users/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(analyticsUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  // TODO wire this up with generic DownloadCsvButton component
  static fetchUnerolledRegisteredLearnersCsv() {
    const { enterpriseId } = store.getState().portalConfiguration;
    const jwtToken = getAccessToken();
    const queryParams = {
      has_enrollments: false,
      no_page: true,
    };
    const csvUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/users.csv/?${qs.stringify(queryParams)}`;

    return httpClient.get(csvUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchEnrolledLearners(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const queryParams = {
      page: 1,
      page_size: 50,
      has_enrollments: true,
      extra_fields: 'enrollment_count',
      ...options,
    };

    const analyticsUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/users/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(analyticsUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  // TODO wire this up with generic DownloadCsvButton component
  static fetchEnrolledLearnersCsv() {
    const { enterpriseId } = store.getState().portalConfiguration;
    const jwtToken = getAccessToken();
    const queryParams = {
      has_enrollments: true,
      extra_fields: 'enrollment_count',
      no_page: true,
    };
    const csvUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/users.csv/?${qs.stringify(queryParams)}`;

    return httpClient.get(csvUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  static fetchCompletedLearners(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const queryParams = {
      page: 1,
      page_size: 50,
      ...options,
    };

    const analyticsUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/learner_completed_courses/?${qs.stringify(queryParams)}`;
    const jwtToken = getAccessToken();

    return httpClient.get(analyticsUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }

  // TODO wire this up with generic DownloadCsvButton component
  static fetchCompletedLearnersCsv() {
    const { enterpriseId } = store.getState().portalConfiguration;
    const jwtToken = getAccessToken();
    const queryParams = {
      no_page: true,
    };
    const csvUrl = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/learner_completed_courses.csv/?${qs.stringify(queryParams)}`;

    return httpClient.get(csvUrl, {
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    });
  }
}

export default EnterpriseDataApiService;
