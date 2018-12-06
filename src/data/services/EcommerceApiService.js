import qs from 'query-string';

import apiClient from '../apiClient';
import { configuration } from '../../config';
import store from '../store';


class EcommerceApiService {
  static ecommerceBaseUrl = 'http://localhost:8012/api/v2'; // configuration.ECOMMERCE_API_BASE_URL;

  static fetchCouponOrders(options = {}) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const endpoint = 'overview';
    const queryParams = {
      page: 1,
      page_size: 50,
      ...options,
    };

    const url = `${EcommerceApiService.ecommerceBaseUrl}/enterprise/coupons/${enterpriseId}/${endpoint}/?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }

  static fetchCouponDetails(couponId, options = {}, { csv } = {}) {
    csv = true
    const endpoint = csv ? 'codes/?format=csv' : 'codes';
    const queryParams = {
      page: 1,
      page_size: 50,
      no_page: csv,
      ...options,
    };

    if (csv) {
      queryParams['format'] ='csv'
      return Promise.resolve({
        data: 'assigned_to,code,redeem_url,redemptions.available,redemptions.used\r\n,UMY3Z5ZUOUQMFYLX,https://testserver.fake/coupons/offer/?code=UMY3Z5ZUOUQMFYLX,3,3\r\n,UMY3Z5ZUOUQMFYLX,https://testserver.fake/coupons/offer/?code=UMY3Z5ZUOUQMFYLX,3,3\r\n,UMY3Z5ZUOUQMFYLX,https://testserver.fake/coupons/offer/?code=UMY3Z5ZUOUQMFYLX,3,3\r\n,UNKA23D6Y2MC5Z6C,https://testserver.fake/coupons/offer/?code=UNKA23D6Y2MC5Z6C,3,3\r\n,UNKA23D6Y2MC5Z6C,https://testserver.fake/coupons/offer/?code=UNKA23D6Y2MC5Z6C,3,3\r\n,UNKA23D6Y2MC5Z6C,https://testserver.fake/coupons/offer/?code=UNKA23D6Y2MC5Z6C,3,3\r\n',
      });
    }

    const url = `${EcommerceApiService.ecommerceBaseUrl}/enterprise/coupons/${couponId}/${endpoint}/?${qs.stringify(queryParams)}`;
    return apiClient.get(url);
  }
}

export default EcommerceApiService;
