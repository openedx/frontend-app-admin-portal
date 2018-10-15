import EcommerceApiService from '../../src/data/services/EcommerceApiService';

import { codes, coupons } from './data';

const rewire = () => {
  EcommerceApiService.fetchCouponOrders = () => Promise.resolve({
    data: coupons,
  });

  EcommerceApiService.fetchCouponDetails = () => Promise.resolve({
    data: codes,
  });
};

export default rewire;
