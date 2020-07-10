import apiClient from '../apiClient';
import { configuration } from '../../config';

class ZendeskApiService {
    static baseUrl = configuration.LMS_BASE_URL;
    static createZendeskTicket(options) {
      const url = `${ZendeskApiService.baseUrl}/zendesk_proxy/v1`;
      const data = {
        requester: {
          email: options.emailAddress,
          name: options.enterpriseName,
        },
        subject: 'Enterprise Admin Support',
        comment: {
          body: options.notes,
          uploads: [],
        },
        custom_fields: [],
        tags: ['enterprise_admin_support'],
      };
      return apiClient.post(url, data, 'json');
    }
}

export default ZendeskApiService;
