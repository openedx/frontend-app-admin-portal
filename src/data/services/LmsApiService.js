import qs from 'query-string';

import apiClient from '../apiClient';
import { configuration } from '../../config';

class LmsApiService {
  static baseUrl = configuration.LMS_BASE_URL;
  static reportingConfigUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise_customer_reporting/`

  static fetchCourseOutline(courseId) {
    const options = {
      course_id: courseId,
      username: 'staff',
      depth: 'all',
      nav_depth: 3,
      block_types_filter: 'course,chapter,sequential,vertical',
    };

    const outlineUrl = `${LmsApiService.baseUrl}/api/courses/v1/blocks/?${qs.stringify(options)}`;
    return apiClient.get(outlineUrl);
  }

  static fetchEnterpriseList(options) {
    const queryParams = {
      page: 1,
      page_size: 50,
      ...options,
    };
    const enterpriseListUrl = `${LmsApiService.baseUrl}/enterprise/api/v1/enterprise-customer/dashboard_list/?${qs.stringify(queryParams)}`;
    return apiClient.get(enterpriseListUrl);
  }

  static fetchEnterpriseBySlug(slug) {
    return this.fetchEnterpriseList({ enterprise_slug: slug })
      // Because we expect only one enterprise by slug we return only the first result
      .then((response) => {
        const { data } = response;
        const results = data && data.results;
        return {
          data: results && results.length && results[0],
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
    return apiClient.post(requestCodesUrl, postParams, 'json');
  }

  static fetchReportingConfigs(uuid) {
    return apiClient.get(`${LmsApiService.reportingConfigUrl}?enterprise_customer=${uuid}`);
  }

  static postNewReportingConfig(formData) {
    return apiClient.post(LmsApiService.reportingConfigUrl, formData, 'json');
  }

  static updateReportingConfig(formData, uuid) {
    const reportingConfigUrl = `${LmsApiService.reportingConfigUrl}${uuid}/`;
    return apiClient.put(reportingConfigUrl, formData, 'json');
  }

  static deleteReportingConfig(uuid) {
    const reportingConfigUrl = `${LmsApiService.reportingConfigUrl}${uuid}/`;
    return apiClient.delete(reportingConfigUrl);
  }

  static postNewProviderConfig(formData) {
    const providerConfigUrl = `${LmsApiService.baseUrl}/auth/saml/v0/providerconfig/`;
    return apiClient.post(providerConfigUrl, formData, 'json');
  }

  static updateProviderConfig(formData, pid) {
    const providerConfigUrl = `${LmsApiService.baseUrl}/auth/saml/v0/providerconfig/${pid}/`;
    return apiClient.put(providerConfigUrl, formData, 'json');
  }

  static deleteProviderConfig(pid) {
    const providerConfigUrl = `${LmsApiService.baseUrl}/auth/saml/v0/providerconfig/${pid}/`;
    return apiClient.delete(providerConfigUrl);
  }

  static createProviderData(formData) {
    const providerDataUrl = `${LmsApiService.baseUrl}/auth/saml/v0/providerdata/`;
    return apiClient.post(providerDataUrl, formData, 'json');
  }

  static deleteProviderData(pdid) {
    const providerDataUrl = `${LmsApiService.baseUrl}/auth/saml/v0/providerdata/${pdid}`;
    return apiClient.delete(providerDataUrl);
  }
}


export default LmsApiService;
