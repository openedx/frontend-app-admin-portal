import apiClient from '../apiClient';
import { configuration } from '../../config';


 // API Service that creates a Zendesk ticket by making a call to the Zendesk API proxy located within edx-platform.
class ZendeskApiService {
  /**
   * A method to create a Zendesk ticket and make a post request to the Zendesk API proxy.
   * The proxy will create the ticket with these parameters.
   * @param options form data that is passed in
   */
  static createZendeskTicket(options) {
    const url = `${configuration.LMS_BASE_URL}/zendesk_proxy/v1`;
    const data = {
      requester: {
        email: options.emailAddress,
        name: options.enterpriseName,
      },
      subject: options.subject,
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
