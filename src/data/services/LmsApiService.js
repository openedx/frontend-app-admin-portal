import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { configuration } from '../../config';

class LmsApiService {
  static apiClient = getAuthenticatedHttpClient;

  static baseUrl = configuration.LMS_BASE_URL;

  static reportingConfigUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise_customer_reporting/`

  static reportingConfigTypesUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise_report_types/`

  static enterpriseCustomerUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer/`;

  static providerConfigUrl = `${LmsApiService.baseUrl}/auth/saml/v0/provider_config/`;

  static providerDataUrl = `${LmsApiService.baseUrl}/auth/saml/v0/provider_data/`;

  static providerDataSyncUrl = `${LmsApiService.baseUrl}/auth/saml/v0/provider_data/sync_provider_data/`;

  static lmsIntegrationUrl = `${LmsApiService.baseUrl}/integrated_channels/api/v1`;

  static createPendingUsersUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/link_pending_enterprise_users`;

  static enterpriseCustomerCatalogsUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise_catalogs/`;

  static notificationReadUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/read_notification`;

  static enterpriseCustomerInviteKeyListUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer-invite-key/basic-list/`;

  static enterpriseCustomerInviteKeyUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer-invite-key/`

  static fetchCourseOutline(courseId) {
    const options = {
      course_id: courseId,
      username: 'staff',
      depth: 'all',
      nav_depth: 3,
      block_types_filter: 'course,chapter,sequential,vertical',
    };
    const queryParams = new URLSearchParams(options);

    const outlineUrl = `${LmsApiService.baseUrl}/api/courses/v1/blocks/?${queryParams.toString()}`;
    return LmsApiService.apiClient().get(outlineUrl);
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
        return {
          data: results?.length && results[0],
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

  static fetchReportingConfigs(uuid) {
    return LmsApiService.apiClient().get(`${LmsApiService.reportingConfigUrl}?enterprise_customer=${uuid}`);
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

  static createProviderData(formData) {
    const providerDataUrl = `${LmsApiService.providerDataUrl}`;
    return LmsApiService.apiClient().post(providerDataUrl, formData);
  }

  static deleteProviderData(pdid, uuid) {
    const providerDataUrl = `${LmsApiService.providerDataUrl}${pdid}/?enterprise_customer_uuid=${uuid}`;
    return LmsApiService.apiClient().delete(providerDataUrl);
  }

  static syncProviderData(formData) {
    return LmsApiService.apiClient().post(LmsApiService.providerDataSyncUrl, formData);
  }

  static fetchSamlConfigurations() {
    const samlConfigUrl = `${LmsApiService.baseUrl}/auth/saml/v0/saml_configuration/`;
    return LmsApiService.apiClient().get(samlConfigUrl);
  }

  static fetchMoodleConfig(uuid) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/moodle/configuration/?enterprise_customer=${uuid}`);
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

  static fetchSingleCanvasConfig(configId) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/canvas/configuration/${configId}/`);
  }

  static fetchCanvasConfig(uuid) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/canvas/configuration/?enterprise_customer=${uuid}`);
  }

  static postNewCanvasConfig(formData) {
    return LmsApiService.apiClient().post(`${LmsApiService.lmsIntegrationUrl}/canvas/configuration/`, formData);
  }

  static updateCanvasConfig(formData, id) {
    return LmsApiService.apiClient().put(`${LmsApiService.lmsIntegrationUrl}/canvas/configuration/${id}/`, formData);
  }

  static deleteCanvasConfig(configId) {
    return LmsApiService.apiClient().delete(`${LmsApiService.lmsIntegrationUrl}/Canvas/configuration/${configId}/`);
  }

  static fetchBlackboardGlobalConfig() {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/blackboard/global-configuration/`);
  }

  static fetchBlackboardConfig(uuid) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/blackboard/configuration/?enterprise_customer=${uuid}`);
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

  static fetchSuccessFactorsConfig(uuid) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/sap_success_factors/configuration/?enterprise_customer=${uuid}`);
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

  static fetchDegreedConfig(uuid) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/degreed/configuration/?enterprise_customer=${uuid}`);
  }

  static postNewDegreedConfig(formData) {
    return LmsApiService.apiClient().post(`${LmsApiService.lmsIntegrationUrl}/degreed/configuration/`, formData);
  }

  static updateDegreedConfig(formData, configId) {
    return LmsApiService.apiClient().put(`${LmsApiService.lmsIntegrationUrl}/degreed/configuration/${configId}/`, formData);
  }

  static deleteDegreedConfig(configId) {
    return LmsApiService.apiClient().delete(`${LmsApiService.lmsIntegrationUrl}/degreed/configuration/${configId}/`);
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

  static fetchCornerstoneConfig(uuid) {
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/cornerstone/configuration/?enterprise_customer=${uuid}`);
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

  static createPendingEnterpriseUsers(formData, uuid) {
    return LmsApiService.apiClient().post(`${LmsApiService.createPendingUsersUrl}/${uuid}`, formData);
  }

  static fetchEnterpriseCustomerCatalogs(enterpriseId) {
    return LmsApiService.apiClient().get(`${LmsApiService.enterpriseCustomerCatalogsUrl}?enterprise_customer=${enterpriseId}`);
  }

  static markBannerNotificationAsRead(formData) {
    return LmsApiService.apiClient().post(LmsApiService.notificationReadUrl, formData);
  }

  static fetchEnterpriseCustomerIntegrationConfigs(options) {
    const queryParams = new URLSearchParams(options);
    return LmsApiService.apiClient().get(`${LmsApiService.lmsIntegrationUrl}/configs/?${queryParams.toString()}`);
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

  static getAccessLinks = (enterpriseUUID) => {
    const queryParams = new URLSearchParams();
    queryParams.append('enterprise_customer_uuid', enterpriseUUID);
    queryParams.append('ordering', '-created');
    const url = `${LmsApiService.enterpriseCustomerInviteKeyListUrl}?${queryParams.toString()}`;
    return LmsApiService.apiClient().get(url);
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
    return LmsApiService.apiClient().patch(
      `${LmsApiService.enterpriseCustomerInviteKeyUrl}${enterpriseCustomerInviteKeyUUID}/`,
      formData,
    );
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
    return LmsApiService.apiClient().patch(
      `${LmsApiService.enterpriseCustomerUrl}${enterpriseUUID}/toggle_universal_link/`,
      formData,
    );
  }
}

export default LmsApiService;
