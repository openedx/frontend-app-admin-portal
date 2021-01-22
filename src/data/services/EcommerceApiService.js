import qs from 'query-string';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { configuration } from '../../config';
import store from '../store';
import { EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE } from '../constants/emailTemplate';

class EcommerceApiService {
  static ecommerceBaseUrl = configuration.ECOMMERCE_BASE_URL;

  static apiClient = getAuthenticatedHttpClient

  static fetchCouponOrders(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const queryParams = {
      page: 1,
      page_size: 50,
      filter: 'active',
      ...options,
    };

    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${enterpriseId}/overview/?${qs.stringify(queryParams)}`;
    return EcommerceApiService.apiClient().get(url);
  }

  static fetchCouponDetails(couponId, options, { csv } = {}) {
    const endpoint = csv ? 'codes.csv' : 'codes';
    const queryParams = {
      page: 1,
      page_size: 50,
      ...options,
    };

    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/${endpoint}/?${qs.stringify(queryParams)}`;
    return EcommerceApiService.apiClient().get(url);
  }

  static sendCodeAssignment(couponId, options) {
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/assign/`;
    return EcommerceApiService.apiClient().post(url, options, 'json');
  }

  static sendCodeReminder(couponId, options) {
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/remind/`;
    return EcommerceApiService.apiClient().post(url, options, 'json');
  }

  static sendCodeRevoke(couponId, options) {
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/revoke/`;
    return EcommerceApiService.apiClient().post(url, options, 'json');
  }

  static sendCodeVisibility(couponId, codeIds, isPublic) {
    const url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${couponId}/visibility/`;
    return EcommerceApiService.apiClient().post(url, { code_ids: codeIds, is_public: isPublic }, 'json');
  }

  static fetchCodeSearchResults(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    let url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/coupons/${enterpriseId}/search/`;
    if (options) {
      url += `?${qs.stringify(options)}`;
    }
    return EcommerceApiService.apiClient().get(url);
  }

  static fetchEmailTemplate(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    let url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/offer-assignment-email-template/${enterpriseId}/`;
    if (options) {
      url += `?${qs.stringify(options)}`;
    }
    return EcommerceApiService.apiClient().get(url);
  }

  static saveTemplate(options) {
    const { enterpriseId } = store.getState().portalConfiguration;
    const { emailTemplateSource } = store.getState().emailTemplate;
    let url = `${EcommerceApiService.ecommerceBaseUrl}/api/v2/enterprise/offer-assignment-email-template/${enterpriseId}/`;
    if (emailTemplateSource === EMAIL_TEMPLATE_SOURCE_FROM_TEMPLATE) {
      url = `${url}${options.id}/`;
      return EcommerceApiService.apiClient().put(url, options, 'json');
    }
    return EcommerceApiService.apiClient().post(url, options, 'json');
  }
}

export default EcommerceApiService;
