import qs from 'query-string';

import apiClient from '../../data/apiClient';
import { configuration } from '../../config';

class EmailTemplateApiService {
  static licenseManagerBaseUrl = `${configuration.LICENSE_MANAGER_BASE_URL}/api/v1`;

  static fetchEmailTemplates({ enterpriseCustomer, templateType }) {
    const queryParams = { email_type: templateType };

    const url = `${EmailTemplateApiService.licenseManagerBaseUrl}/email-template/${enterpriseCustomer}/?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }

  static createEmailTemplate({ enterpriseCustomer, emailTemplateData }) {
    const url = `${EmailTemplateApiService.licenseManagerBaseUrl}/email-template/${enterpriseCustomer}/`;
    return apiClient.post(url, emailTemplateData, 'json');
  }

  static updateEmailTemplate({ enterpriseCustomer, emailTemplateId, emailTemplateData }) {
    const url = `${EmailTemplateApiService.licenseManagerBaseUrl}/email-template/${enterpriseCustomer}/${emailTemplateId}/`;
    return apiClient.put(url, emailTemplateData, 'json');
  }
}

export default EmailTemplateApiService;
