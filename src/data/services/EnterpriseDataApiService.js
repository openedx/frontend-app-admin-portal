import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { snakeCaseObject, camelCaseObject } from '@edx/frontend-platform/utils';
import omitBy from 'lodash/omitBy';

import { isFalsy } from '../../utils';

import store from '../store';
import { configuration } from '../../config';

class EnterpriseDataApiService {
  // TODO: This should access the data-api through the gateway instead of direct
  static apiClient = getAuthenticatedHttpClient;

  static enterpriseBaseUrl = `${configuration.DATA_API_BASE_URL}/enterprise/api/v1/enterprise/`;

  static enterpriseAdminBaseUrl = `${configuration.DATA_API_BASE_URL}/enterprise/api/v1/admin/`;

  static enterpriseAdminAnalyticsV2BaseUrl = `${configuration.DATA_API_BASE_URL}/enterprise/api/v1/admin/analytics/`;

  static constructAnalyticsDataURL(key, baseURL) {
    const dataURLsMap = {
      skills: `${baseURL}/skills/stats`,
      completions: `${baseURL}/completions/stats`,
      engagements: `${baseURL}/engagements/stats`,
      enrollments: `${baseURL}/enrollments/stats`,
      leaderboardTable: `${baseURL}/leaderboard`,
      completionsTable: `${baseURL}/completions`,
      engagementsTable: `${baseURL}/engagements`,
      enrollmentsTable: `${baseURL}/enrollments`,
    };

    return dataURLsMap[key];
  }

  static getEnterpriseUUID(enterpriseId) {
    const { enableDemoData } = store.getState().portalConfiguration;
    return enableDemoData ? configuration.DEMO_ENTEPRISE_UUID : enterpriseId;
  }

  static fetchDashboardAnalytics(enterpriseId) {
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseId);
    const { enableAuditDataReporting } = store.getState().portalConfiguration;
    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseUUID}/enrollments/overview/?audit_enrollments=${enableAuditDataReporting}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchCourseEnrollments(enterpriseId, options, { csv } = {}) {
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseId);
    const endpoint = csv ? 'enrollments.csv' : 'enrollments';
    const { enableAuditDataReporting } = store.getState().portalConfiguration;
    const queryParams = new URLSearchParams({
      page: 1,
      page_size: 50,
      audit_enrollments: enableAuditDataReporting,
      ...snakeCaseObject(options),
    });

    if (csv) {
      queryParams.set('no_page', csv);
    }

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseUUID}/${endpoint}/?${queryParams.toString()}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchEnterpriseOfferSummary(enterpriseId, offerId, options = {}) {
    let url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseId}/offers/${offerId}/`;
    if (Object.keys(options).length) {
      const queryParams = new URLSearchParams({
        ...snakeCaseObject(options),
      });
      url += `?${queryParams.toString()}`;
    }
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchUnenrolledRegisteredLearners(enterpriseId, options, { csv } = {}) {
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseId);
    const endpoint = csv ? 'users.csv' : 'users';
    const { enableAuditDataReporting } = store.getState().portalConfiguration;
    const queryParams = new URLSearchParams({
      page: 1,
      page_size: 50,
      has_enrollments: false,
      audit_enrollments: enableAuditDataReporting,
      ...options,
    });

    if (csv) {
      queryParams.set('no_page', csv);
    }

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseUUID}/${endpoint}/?${queryParams.toString()}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchEnrolledLearners(enterpriseId, options, { csv } = {}) {
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseId);
    const endpoint = csv ? 'users.csv' : 'users';
    const { enableAuditDataReporting } = store.getState().portalConfiguration;
    const queryParams = new URLSearchParams({
      page: 1,
      page_size: 50,
      has_enrollments: true,
      extra_fields: ['enrollment_count'],
      audit_enrollments: enableAuditDataReporting,
      ...options,
    });

    if (csv) {
      queryParams.set('no_page', csv);
    }

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseUUID}/${endpoint}/?${queryParams.toString()}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchEnrolledLearnersForInactiveCourses(enterpriseId, options, { csv } = {}) {
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseId);
    const endpoint = csv ? 'users.csv' : 'users';
    const { enableAuditDataReporting } = store.getState().portalConfiguration;
    const queryParams = new URLSearchParams({
      page: 1,
      page_size: 50,
      has_enrollments: true,
      active_courses: false,
      all_enrollments_passed: true,
      extra_fields: ['enrollment_count', 'course_completion_count'],
      audit_enrollments: enableAuditDataReporting,
      ...options,
    });

    if (csv) {
      queryParams.set('no_page', csv);
    }

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseUUID}/${endpoint}/?${queryParams.toString()}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchCompletedLearners(enterpriseId, options, { csv } = {}) {
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseId);
    const endpoint = csv ? 'learner_completed_courses.csv' : 'learner_completed_courses';
    const { enableAuditDataReporting } = store.getState().portalConfiguration;
    const queryParams = new URLSearchParams({
      page: 1,
      page_size: 50,
      audit_enrollments: enableAuditDataReporting,
      ...options,
    });

    if (csv) {
      queryParams.set('no_page', csv);
    }

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseUUID}/${endpoint}/?${queryParams.toString()}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchAdminAnalyticsData(enterpriseCustomerUUID, key, options) {
    const baseURL = EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl;
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseCustomerUUID);
    const transformOptions = omitBy(snakeCaseObject(options), isFalsy);
    const queryParams = new URLSearchParams(transformOptions);
    const tableURL = EnterpriseDataApiService.constructAnalyticsDataURL(key, `${baseURL}${enterpriseUUID}`);
    const url = `${tableURL}?${queryParams.toString()}`;
    return EnterpriseDataApiService.apiClient().get(url).then((response) => camelCaseObject(response.data));
  }

  static fetchAdminAggregatesData(enterpriseCustomerUUID, options) {
    const baseURL = EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl;
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseCustomerUUID);
    const transformOptions = omitBy(snakeCaseObject(options), isFalsy);
    const queryParams = new URLSearchParams(transformOptions);
    const url = `${baseURL}${enterpriseUUID}?${queryParams.toString()}`;
    return EnterpriseDataApiService.apiClient().get(url).then((response) => camelCaseObject(response.data));
  }

  static fetchDashboardInsights(enterpriseId) {
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseId);
    const url = `${EnterpriseDataApiService.enterpriseAdminBaseUrl}insights/${enterpriseUUID}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchEnterpriseBudgets(enterpriseId) {
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseId);
    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseUUID}/budgets/`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchEnterpriseModuleActivityReport(enterpriseId, options, { csv } = {}) {
    const enterpriseUUID = EnterpriseDataApiService.getEnterpriseUUID(enterpriseId);
    const endpoint = csv ? 'module-performance.csv' : 'module-performance';

    const queryParams = new URLSearchParams({
      page: 1,
      page_size: 50,
      ...options,
    });

    if (csv) {
      queryParams.set('no_page', csv);
    }

    const url = `${EnterpriseDataApiService.enterpriseBaseUrl}${enterpriseUUID}/${endpoint}/?${queryParams.toString()}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static fetchPlotlyChartsCSV(enterpriseId, chartUrl, options) {
    const url = `${EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl}${enterpriseId}/${chartUrl}?${new URLSearchParams(options).toString()}`;
    return EnterpriseDataApiService.apiClient().get(url);
  }

  static getAnalyticsCSVDownloadURL(key, enterpriseId, options) {
    const queryParams = new URLSearchParams({
      ...options,
      ...{ response_type: 'csv' },
    });
    const tableURL = EnterpriseDataApiService.constructAnalyticsDataURL(
      key,
      `${EnterpriseDataApiService.enterpriseAdminAnalyticsV2BaseUrl}${enterpriseId}`,
    );
    return `${tableURL}?${queryParams.toString()}`;
  }
}

export default EnterpriseDataApiService;
