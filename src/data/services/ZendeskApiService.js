import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { configuration } from '../../config';

/**
* API Service that makes a call to the Zendesk API proxy in edx-platform.
*/
class ZendeskApiService {
  /**
   * Creates a Zendesk ticket and makes a post request to the Zendesk API proxy.
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
    return getAuthenticatedHttpClient().post(url, data, 'json');
  }
}

export default ZendeskApiService;
