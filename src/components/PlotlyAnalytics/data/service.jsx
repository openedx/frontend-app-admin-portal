import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { configuration } from '../../../config';

class PlotlyAnalyticsApiService {
  static lmsBaseUrl = configuration.LMS_BASE_URL;

  static plotlyTokenUrl = `${PlotlyAnalyticsApiService.lmsBaseUrl}/enterprise/api/v1/plotly_token`;

  static fetchPlotlyToken(options) {
    // eslint-disable-next-line no-unused-vars
    const queryParams = {
      ...options,
    };
    return getAuthenticatedHttpClient().get(`${PlotlyAnalyticsApiService.plotlyTokenUrl}/${queryParams.enterpriseId}`);
  }
}

export default PlotlyAnalyticsApiService;
