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

  static fetchCouponDetails() {
    // TODO replace with fetching data from ecommerce API
    return Promise.resolve({
      data: {
        results: [],
      },
    });
  }

  static sendCodeAssignment() {
    // TODO replace with sending data to ecommerce API
    // return Promise.reject(new Error('yo dawg!'));

    return Promise.resolve({
      data: {
        results: [],
      },
    });
  }
}

export default EcommerceApiService;
