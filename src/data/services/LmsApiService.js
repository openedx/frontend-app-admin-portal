import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { configuration } from '../../config';
import generateFormattedStatusUrl from './apiServiceUtils';

class LmsApiService {
  static apiClient = getAuthenticatedHttpClient;

  static baseUrl = configuration.LMS_BASE_URL;

  static reportingConfigUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise_customer_reporting/`;

  static reportingConfigTypesUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise_report_types/`;

  static enterpriseCustomerUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer/`;

  static enterpriseCustomerBrandingUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer-branding/update-branding/`;

  static enterpriseCustomerMembersUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer-members/`;

  static providerConfigUrl = `${LmsApiService.baseUrl}/auth/saml/v0/provider_config/`;

  static providerDataUrl = `${LmsApiService.baseUrl}/auth/saml/v0/provider_data/`;

  static providerDataSyncUrl = `${LmsApiService.baseUrl}/auth/saml/v0/provider_data/sync_provider_data/`;

  static lmsIntegrationUrl = `${LmsApiService.baseUrl}/integrated_channels/api/v1`;

  static lmsContentSyncStatusUrl = `${LmsApiService.baseUrl}/integrated_channels/api/v1/logs/content_sync_status`;

  static lmsLearnerSyncStatusUrl = `${LmsApiService.baseUrl}/integrated_channels/api/v1/logs/learner_sync_status`;

  static createPendingUsersUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/link_pending_enterprise_users`;

  static notificationReadUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/read_notification`;

  static enterpriseCustomerInviteKeyListUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer-invite-key/basic-list/`;

  static enterpriseCustomerInviteKeyUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer-invite-key/`;

  static apiCredentialsUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer-api-credentials/`;

  static enterpriseSsoOrchestrationUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise_customer_sso_configuration/`;

  static enterpriseGroupUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-group/`;

  static enterpriseGroupListUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise_group/`;

  static enterpriseLearnerUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-learner/`;

  static createEnterpriseGroup(options) {
    const postParams = {
      name: options.groupName,
      enterprise_customer: options.enterpriseUUID,
      members: [],
    };
    const createEnterpriseGroupUrl = `${LmsApiService.enterpriseGroupListUrl}`;
    return LmsApiService.apiClient().post(createEnterpriseGroupUrl, postParams);
  }

  static fetchEnterpriseSsoOrchestrationRecord(configurationUuid) {
    const enterpriseSsoOrchestrationFetchUrl = `${LmsApiService.enterpriseSsoOrchestrationUrl}${configurationUuid}`;
    return LmsApiService.apiClient().get(enterpriseSsoOrchestrationFetchUrl);
  }

  static listEnterpriseSsoOrchestrationRecords(enterpriseCustomerUuid) {
    const enterpriseSsoOrchestrationListUrl = `${LmsApiService.enterpriseSsoOrchestrationUrl}`;
    if (enterpriseCustomerUuid) {
      return LmsApiService.apiClient().get(`${enterpriseSsoOrchestrationListUrl}?enterprise_customer=${enterpriseCustomerUuid}`);
    }
    return LmsApiService.apiClient().get(enterpriseSsoOrchestrationListUrl);
  }

  static createEnterpriseSsoOrchestrationRecord(formData) {
    return LmsApiService.apiClient().post(LmsApiService.enterpriseSsoOrchestrationUrl, formData);
  }

  static updateEnterpriseSsoOrchestrationRecord(formData, configurationUuid) {
    const enterpriseSsoOrchestrationUpdateUrl = `${LmsApiService.enterpriseSsoOrchestrationUrl}${configurationUuid}`;
    return LmsApiService.apiClient().put(enterpriseSsoOrchestrationUpdateUrl, formData);
  }

  static deleteEnterpriseSsoOrchestrationRecord(configurationUuid) {
    const enterpriseSsoOrchestrationDeleteUrl = `${LmsApiService.enterpriseSsoOrchestrationUrl}${configurationUuid}`;
    return LmsApiService.apiClient().delete(enterpriseSsoOrchestrationDeleteUrl);
  }

  static fetchEnterpriseList(options) {
    const queryParams = new URLSearchParams({
      page: 1,
      page_size: 50,
      ...options,
    });
    const enterpriseListUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer/dashboard_list/?${queryParams.toString()}`;
    return LmsApiService.apiClient().get(enterpriseListUrl);
  }

  static fetchEnterpriseBySlug(slug) {
    return this.fetchEnterpriseList({ enterprise_slug: slug })
      // Because we expect only one enterprise by slug we return only the first result
      .then((response) => {
        const { data } = response;
        const results = data?.results;
        const enterpriseFeatures = camelCaseObject(data?.enterprise_features);
        return {
          data: results?.[0],
          enterpriseFeatures,
        };
      });
  }

  static requestCodes(options) {
    const postParams = {
      email: options.emailAddress,
      enterprise_name: options.enterpriseName,
      number_of_codes: options.numberOfCodes,
      notes: options.notes,
    };
    const requestCodesUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/request_codes`;
    return LmsApiService.apiClient().post(requestCodesUrl, postParams);
  }

  static fetchReportingConfigs(uuid, pageNumber) {
    let url = `${LmsApiService.reportingConfigUrl}?enterprise_customer=${uuid}`;
    if (pageNumber) {
      url += `&page=${pageNumber}`;
    }

    return LmsApiService.apiClient().get(url);
  }

  static fetchReportingConfigTypes(uuid) {
    return LmsApiService.apiClient().get(`${LmsApiService.reportingConfigTypesUrl}${uuid}`);
  }

  static postNewReportingConfig(formData) {
    return LmsApiService.apiClient().post(LmsApiService.reportingConfigUrl, formData);
  }

  static updateReportingConfig(formData, uuid) {
    const reportingConfigUrl = `${LmsApiService.reportingConfigUrl}${uuid}/`;
    return LmsApiService.apiClient().put(reportingConfigUrl, formData);
  }

  static deleteReportingConfig(uuid) {
    const reportingConfigUrl = `${LmsApiService.reportingConfigUrl}${uuid}/`;
    return LmsApiService.apiClient().delete(reportingConfigUrl);
  }

  static getProviderConfig(uuid) {
    return LmsApiService.apiClient().get(`${LmsApiService.providerConfigUrl}?enterprise_customer_uuid=${uuid}`);
  }

  static postNewProviderConfig(formData) {
    return LmsApiService.apiClient().post(LmsApiService.providerConfigUrl, formData);
  }

  static updateProviderConfig(formData, pid) {
    const providerConfigUrl = `${LmsApiService.providerConfigUrl}${pid}/`;
    return LmsApiService.apiClient().put(providerConfigUrl, formData);
  }

  static deleteProviderConfig(pid, uuid) {
    const providerConfigUrl = `${LmsApiService.providerConfigUrl}${pid}/?enterprise_customer_uuid=${uuid}`;
    return LmsApiService.apiClient().delete(providerConfigUrl);
  }

  static getProviderData(uuid) {
    const providerDataUrl = `${LmsApiService.providerDataUrl}?enterprise_customer_uuid=${uuid}`;
    return LmsApiService.apiClient().get(providerDataUrl);
  }

  static deleteProviderData(pdid, uuid) {
    const providerDataUrl = `${LmsApiService.providerDataUrl}${pdid}/?enterprise_customer_uuid=${uuid}`;
    return LmsApiService.apiClient().delete(providerDataUrl);
  }

  static syncProviderData(formData) {
    return LmsApiService.apiClient().post(LmsApiService.providerDataSyncUrl, formData);
  }

  static fetchBlackboardGlobalConfig() {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/blackboard/global-configuration/`);
  }

  static fetchSingleBlackboardConfig(configId) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/blackboard/configuration/${configId}/`);
  }

  static postNewBlackboardConfig(formData) {
    return LmsApiService.apiClient().post(`${LmsApiService.lmsIntegrationUrl}/blackboard/configuration/`, formData);
  }

  static updateBlackboardConfig(formData, configId) {
    return LmsApiService.apiClient().put(`${LmsApiService.lmsIntegrationUrl}/blackboard/configuration/${configId}/`, formData);
  }

  static deleteBlackboardConfig(configId) {
    return LmsApiService.apiClient().delete(`${LmsApiService.lmsIntegrationUrl}/blackboard/configuration/${configId}/`);
  }

  static fetchSingleCanvasConfig(configId) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/canvas/configuration/${configId}/`);
  }

  static postNewCanvasConfig(formData) {
    return LmsApiService.apiClient().post(`${LmsApiService.lmsIntegrationUrl}/canvas/configuration/`, formData);
  }

  static updateCanvasConfig(formData, id) {
    return LmsApiService.apiClient().put(`${LmsApiService.lmsIntegrationUrl}/canvas/configuration/${id}/`, formData);
  }

  static deleteCanvasConfig(configId) {
    return LmsApiService.apiClient().delete(`${LmsApiService.lmsIntegrationUrl}/canvas/configuration/${configId}/`);
  }

  static fetchSingleCornerstoneConfig(configId) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/cornerstone/configuration/${configId}/`);
  }

  static postNewCornerstoneConfig(formData) {
    return LmsApiService.apiClient().post(`${LmsApiService.lmsIntegrationUrl}/cornerstone/configuration/`, formData);
  }

  static updateCornerstoneConfig(formData, configId) {
    return LmsApiService.apiClient().put(`${LmsApiService.lmsIntegrationUrl}/cornerstone/configuration/${configId}/`, formData);
  }

  static deleteCornerstoneConfig(configId) {
    return LmsApiService.apiClient().delete(`${LmsApiService.lmsIntegrationUrl}/cornerstone/configuration/${configId}/`);
  }

  static postNewDegreedConfig(formData) {
    return LmsApiService.apiClient().post(`${LmsApiService.lmsIntegrationUrl}/degreed/configuration/`, formData);
  }

  static fetchSingleDegreedConfig(configId) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/degreed/configuration/${configId}/`);
  }

  static updateDegreedConfig(formData, configId) {
    return LmsApiService.apiClient().put(`${LmsApiService.lmsIntegrationUrl}/degreed/configuration/${configId}/`, formData);
  }

  static deleteDegreedConfig(configId) {
    return LmsApiService.apiClient().delete(`${LmsApiService.lmsIntegrationUrl}/degreed/configuration/${configId}/`);
  }

  static fetchSingleDegreed2Config(configId) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/degreed2/configuration/${configId}/`);
  }

  static postNewDegreed2Config(formData) {
    return LmsApiService.apiClient().post(`${LmsApiService.lmsIntegrationUrl}/degreed2/configuration/`, formData);
  }

  static updateDegreed2Config(formData, configId) {
    return LmsApiService.apiClient().put(`${LmsApiService.lmsIntegrationUrl}/degreed2/configuration/${configId}/`, formData);
  }

  static deleteDegreed2Config(configId) {
    return LmsApiService.apiClient().delete(`${LmsApiService.lmsIntegrationUrl}/degreed2/configuration/${configId}/`);
  }

  static fetchSingleMoodleConfig(configId) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/moodle/configuration/${configId}/`);
  }

  static postNewMoodleConfig(formData) {
    return LmsApiService.apiClient().post(`${LmsApiService.lmsIntegrationUrl}/moodle/configuration/`, formData);
  }

  static updateMoodleConfig(formData, configId) {
    return LmsApiService.apiClient().put(`${LmsApiService.lmsIntegrationUrl}/moodle/configuration/${configId}/`, formData);
  }

  static deleteMoodleConfig(configId) {
    return LmsApiService.apiClient().delete(`${LmsApiService.lmsIntegrationUrl}/moodle/configuration/${configId}/`);
  }

  static fetchSingleSuccessFactorsConfig(configId) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/sap_success_factors/configuration/${configId}/`);
  }

  static postNewSuccessFactorsConfig(formData) {
    return LmsApiService.apiClient().post(`${LmsApiService.lmsIntegrationUrl}/sap_success_factors/configuration/`, formData);
  }

  static updateSuccessFactorsConfig(formData, configId) {
    return LmsApiService.apiClient().put(`${LmsApiService.lmsIntegrationUrl}/sap_success_factors/configuration/${configId}/`, formData);
  }

  static deleteSuccessFactorsConfig(configId) {
    return LmsApiService.apiClient().delete(`${LmsApiService.lmsIntegrationUrl}/sap_success_factors/configuration/${configId}/`);
  }

  static createPendingEnterpriseUsers(formData, uuid) {
    return LmsApiService.apiClient().post(`${LmsApiService.createPendingUsersUrl}/${uuid}`, formData);
  }

  static markBannerNotificationAsRead(formData) {
    return LmsApiService.apiClient().post(LmsApiService.notificationReadUrl, formData);
  }

  static fetchEnterpriseCustomerIntegrationConfigs(options) {
    const queryParams = new URLSearchParams(options);
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/configs/?${queryParams.toString()}`);
  }

  static fetchContentMetadataItemTransmission(uuid, channelCode, configId, currentPage, options) {
    const syncStatusPath = `${LmsApiService.lmsContentSyncStatusUrl}/${uuid}/${channelCode}/${configId}`;
    const getSyncStatusUrl = generateFormattedStatusUrl(syncStatusPath, currentPage, options);
    return LmsApiService.apiClient().get(getSyncStatusUrl);
  }

  static fetchLearnerMetadataItemTransmission(uuid, channelCode, configId, currentPage, options) {
    const syncStatusPath = `${LmsApiService.lmsLearnerSyncStatusUrl}/${uuid}/${channelCode}/${configId}`;
    const getSyncStatusUrl = generateFormattedStatusUrl(syncStatusPath, currentPage, options);
    return LmsApiService.apiClient().get(getSyncStatusUrl);
  }

  /**
   * Creates EnterpriseCustomerInviteKey linked to an enterprise
   * @param {string} enterpriseCustomerUuid Enterprise to set link
   * @param {Date} expirationDate YYYY-MM-DDThh:mm
   */
  static createEnterpriseCustomerLink(enterpriseCustomerUuid, expirationDate) {
    const formData = {
      enterprise_customer_uuid: enterpriseCustomerUuid,
      expiration_date: expirationDate,
    };
    return LmsApiService.apiClient().post(LmsApiService.enterpriseCustomerInviteKeyUrl, formData);
  }

  static getAccessLinks(enterpriseUUID) {
    const queryParams = new URLSearchParams({
      ordering: '-created',
    });
    if (enterpriseUUID) {
      queryParams.set('enterprise_customer_uuid', enterpriseUUID);
    }
    const url = `${LmsApiService.enterpriseCustomerInviteKeyListUrl}?${queryParams.toString()}`;
    return LmsApiService.apiClient().get(url);
  }

  static updateEnterpriseCustomer(enterpriseUUID, options) {
    const url = `${LmsApiService.enterpriseCustomerUrl}${enterpriseUUID}/`;
    return LmsApiService.apiClient().patch(url, options);
  }

  static async fetchEnterpriseCustomer(enterpriseUUID) {
    const url = `${LmsApiService.enterpriseCustomerUrl}${enterpriseUUID}/`;
    return LmsApiService.apiClient().get(url);
  }

  static updateEnterpriseCustomerBranding(enterpriseUUID, options) {
    const url = `${LmsApiService.enterpriseCustomerBrandingUrl}${enterpriseUUID}/`;
    return LmsApiService.apiClient().patch(url, options);
  }

  static fetchEnterpriseCustomerMembers(enterpriseUUID, options) {
    let url = `${LmsApiService.enterpriseCustomerMembersUrl}${enterpriseUUID}/`;
    if (options) {
      const queryParams = new URLSearchParams(options);
      url = `${LmsApiService.enterpriseCustomerMembersUrl}${enterpriseUUID}?${queryParams.toString()}`;
    }
    return LmsApiService.apiClient().get(url, options);
  }

  /**
   * Disables EnterpriseCustomerInviteKey
   * @param {string} enterpriseCustomerInviteKeyUUID uuid EnterpriseCustomerInviteKey to disable
   * @returns {Promise}
   */
  static disableEnterpriseCustomerLink(enterpriseCustomerInviteKeyUUID) {
    const formData = {
      is_active: false,
    };
    const url = `${LmsApiService.enterpriseCustomerInviteKeyUrl}${enterpriseCustomerInviteKeyUUID}/`;
    return LmsApiService.apiClient().patch(url, formData);
  }

  /**
   * Toggles enable_universal_link flag
   * If `enable_universal_link` is true and `expiration_date` is passed, an EnterpriseCustomerInviteKey is created
   * @param {Object} param0 Object with `enterpriseUUID`, `enableUniversalLink`, `expirationDate` (optional)
   * @returns {Promise}
   */
  static toggleEnterpriseCustomerUniversalLink({ enterpriseUUID, enableUniversalLink, expirationDate }) {
    const formData = {
      enable_universal_link: enableUniversalLink,
      expiration_date: expirationDate,
    };
    const url = `${LmsApiService.enterpriseCustomerUrl}${enterpriseUUID}/toggle_universal_link/`;
    return LmsApiService.apiClient().patch(url, formData);
  }

  static fetchAPICredentials(enterpriseUUID) {
    return LmsApiService.apiClient().get(`${LmsApiService.apiCredentialsUrl}${enterpriseUUID}/`);
  }

  static createNewAPICredentials(enterpriseUUID) {
    return LmsApiService.apiClient().post(`${LmsApiService.apiCredentialsUrl}${enterpriseUUID}/`);
  }

  static regenerateAPICredentials(redirectURLs, enterpriseUUID) {
    const requestData = {
      redirect_uris: redirectURLs,
    };
    return LmsApiService.apiClient().put(`${LmsApiService.apiCredentialsUrl}${enterpriseUUID}/regenerate_credentials`, requestData);
  }

  static generateAIAnalyticsSummary(enterpriseUUID, formData) {
    const url = `${LmsApiService.baseUrl}/enterprise/api/v1/analytics-summary/${enterpriseUUID}`;
    return LmsApiService.apiClient().post(url, formData);
  }

  static updateUserActiveEnterprise = (enterpriseId) => {
    const url = `${configuration.LMS_BASE_URL}/enterprise/select/active/`;
    const formData = new FormData();
    formData.append('enterprise', enterpriseId);

    return LmsApiService.apiClient().post(
      url,
      formData,
    );
  };

  static async fetchData(url, linkedEnterprises = []) {
    const response = await getAuthenticatedHttpClient().get(url);
    const responseData = camelCaseObject(response.data);
    const linkedEnterprisesCopy = [...linkedEnterprises];
    linkedEnterprisesCopy.push(...responseData.results);
    if (responseData.next) {
      return LmsApiService.fetchData(responseData.next, linkedEnterprisesCopy);
    }
    return linkedEnterprisesCopy;
  }

  static fetchEnterpriseLearnerData = async (options) => {
    const queryParams = new URLSearchParams({
      ...options,
      page: 1,
    });
    const url = `${LmsApiService.enterpriseLearnerUrl}?${queryParams.toString()}`;
    const response = await LmsApiService.fetchData(url);
    return response;
  };

  static fetchEnterpriseGroup = async (groupUuid) => {
    const groupEndpoint = `${LmsApiService.enterpriseGroupListUrl}${groupUuid}/`;
    return LmsApiService.apiClient().get(groupEndpoint);
  };

  static fetchEnterpriseGroups = async () => {
    const url = `${LmsApiService.enterpriseGroupUrl}`;
    return LmsApiService.apiClient().get(url);
  };

  static inviteEnterpriseLearnersToGroup = async (groupUuid, formData) => {
    const assignLearnerEndpoint = `${LmsApiService.enterpriseGroupListUrl}${groupUuid}/assign_learners/`;
    return LmsApiService.apiClient().post(assignLearnerEndpoint, formData);
  };

  static fetchEnterpriseGroupLearners = async (groupUuid, options) => {
    let enterpriseGroupLearnersEndpoint = `${LmsApiService.enterpriseGroupUrl}${groupUuid}/learners`;
    if (options) {
      const queryParams = new URLSearchParams(options);
      enterpriseGroupLearnersEndpoint = `${LmsApiService.enterpriseGroupUrl}${groupUuid}/learners?${queryParams.toString()}`;
    }
    return LmsApiService.apiClient().get(enterpriseGroupLearnersEndpoint);
  };

  static fetchAllEnterpriseGroupLearners = async (groupUuid) => {
    const queryParams = new URLSearchParams({
      page: 1,
    });
    const url = `${LmsApiService.enterpriseGroupUrl}${groupUuid}/learners?${queryParams.toString()}`;
    const response = await LmsApiService.fetchData(url);
    return response;
  };

  static removeEnterpriseGroup = async (groupUuid) => {
    const removeGroupEndpoint = `${LmsApiService.enterpriseGroupListUrl}${groupUuid}/`;
    return LmsApiService.apiClient().delete(removeGroupEndpoint);
  };

  static updateEnterpriseGroup = async (groupUuid, formData) => {
    const updateGroupEndpoint = `${LmsApiService.enterpriseGroupListUrl}${groupUuid}/`;
    return LmsApiService.apiClient().patch(updateGroupEndpoint, formData);
  };

  static removeEnterpriseLearnersFromGroup = async (groupUuid, formData) => {
    const removeLearnerEndpoint = `${LmsApiService.enterpriseGroupListUrl}${groupUuid}/remove_learners/`;
    return LmsApiService.apiClient().post(removeLearnerEndpoint, formData);
  };

  static fetchEnterpriseLearners = async (options) => {
    const queryParams = new URLSearchParams({
      ...options,
    });
    const url = `${LmsApiService.enterpriseLearnerUrl}?${queryParams.toString()}`;
    return LmsApiService.apiClient().get(url);
  };
}

export default LmsApiService;
