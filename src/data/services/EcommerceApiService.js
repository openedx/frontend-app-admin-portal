import qs from 'query-string';

import apiClient from '../apiClient';
import { configuration } from '../../config';
import store from '../store';

class EcommerceApiService {
  static ecommerceBaseUrl = configuration.ECOMMERCE_BASE_URL;

  static fetchCouponOrders(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const queryParams = {
      page: 1,
      page_size: 50,
      ...options,
    };

    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${enterpriseId}/overview/?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }

  static fetchCouponDetails(couponId, options, { csv } = {}) {
    const endpoint = csv ? 'codes.csv' : 'codes';
    const queryParams = {
      page: 1,
      page_size: 50,
      ...options,
    };

    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/${endpoint}/?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }

  static sendCodeAssignment(couponId, options) {
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/assign/`;
    return apiClient.post(url, options, 'json');
  }

  static sendCodeReminder(couponId, options) {
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/remind/`;
    return apiClient.post(url, options, 'json');
  }
}

export default EcommerceApiService;
