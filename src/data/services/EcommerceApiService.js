import qs from 'query-string';

import apiClient from '../apiClient';
import { configuration } from '../../config';

class EcommerceApiService {
  static ecommerceBaseUrl = configuration.ECOMMERCE_API_BASE_URL;

  static fetchCouponOrders() {
    // TODO replace with fetching data from ecommerce API
    return Promise.resolve({
      data: {
        results: [],
      },
    });
  }

  static fetchCouponDetails(couponId, options = {}, { csv } = {}) {
    const endpoint = csv ? 'codes.csv' : 'codes';
    const queryParams = {
      page: 1,
      page_size: 50,
      no_page: csv,
      ...options,
    };

    const url = `${EcommerceApiService.ecommerceBaseUrl}/enterprise/coupons/${couponId}/${endpoint}/?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }
}

export default EcommerceApiService;
