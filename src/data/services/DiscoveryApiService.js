import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { configuration } from '../../config';

class DiscoveryApiService {
  static discoveryBaseUrl = `${configuration.DISCOVERY_BASE_URL}/api/v1`;

  static apiClient = getAuthenticatedHttpClient;

  static fetchCourseDetails(courseKey) {
    const url = `${DiscoveryApiService.discoveryBaseUrl}/courses/${courseKey}/`;
    return DiscoveryApiService.apiClient().get(url);
  }
}

export default DiscoveryApiService;
