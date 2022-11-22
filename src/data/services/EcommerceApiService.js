import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { snakeCaseObject } from '@edx/frontend-platform/utils';

import { configuration } from '../../config';
import store from '../store';
import { EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE } from '../constants/emailTemplate';

class EcommerceApiService {
  static ecommerceBaseUrl = configuration.ECOMMERCE_BASE_URL;

  static apiClient = getAuthenticatedHttpClient;

  static fetchCouponOrders(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const queryParams = new URLSearchParams({
      page: 1,
      page_size: 50,
      filter: 'active',
      ...options,
    });
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${enterpriseId}/overview/?${queryParams.toString()}`;
    return EcommerceApiService.apiClient().get(url);
  }

  static fetchCoupon(couponId) {
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/`;
    return EcommerceApiService.apiClient(
      {
        useCache: configuration.USE_API_CACHE,
      },
    ).get(url);
  }

  static fetchCouponDetails(couponId, options, { csv } = {}) {
    const endpoint = csv ? 'codes.csv' : 'codes';
    const queryParams = new URLSearchParams({
      page: 1,
      page_size: 50,
      ...options,
    });
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/${endpoint}/?${queryParams.toString()}`;
    return EcommerceApiService.apiClient().get(url);
  }

  static sendCodeAssignment(couponId, options) {
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/assign/`;
    return EcommerceApiService.apiClient().post(url, options);
  }

  static sendCodeReminder(couponId, options) {
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/remind/`;
    return EcommerceApiService.apiClient().post(url, options);
  }

  static sendCodeRevoke(couponId, options) {
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/revoke/`;
    return EcommerceApiService.apiClient().post(url, options);
  }

  static fetchCodeSearchResults(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    let url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${enterpriseId}/search/`;
    if (options) {
      const queryParams = new URLSearchParams(options);
      url += `?${queryParams.toString()}`;
    }
    return EcommerceApiService.apiClient().get(url);
  }

  static fetchEmailTemplate(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    let url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/offer-assignment-email-template/${enterpriseId}/`;
    if (options) {
      const queryParams = new URLSearchParams(options);
      url += `?${queryParams.toString()}`;
    }
    return EcommerceApiService.apiClient().get(url);
  }

  static saveTemplate(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const { emailTemplateSource } = store.getState().emailTemplate;
    let url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/offer-assignment-email-template/${enterpriseId}/`;
    if (emailTemplateSource === EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE) {
      url = `${url}${options.id}/`;
      return EcommerceApiService.apiClient().put(url, options);
    }
    return EcommerceApiService.apiClient().post(url, options);
  }

  static fetchEnterpriseOffers(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    let url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/${enterpriseId}/enterprise-admin-offers/`;
    if (options) {
      const queryParams = new URLSearchParams(snakeCaseObject(options));
      url += `?${queryParams.toString()}`;
    }
    return EcommerceApiService.apiClient().get(url);
  }
}

export default EcommerceApiService;
