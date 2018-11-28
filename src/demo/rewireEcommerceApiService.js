import EcommerceApiService from '../../src/data/services/EcommerceApiService';

import { codes, coupons } from './data';

const firstCouponHasError = coupons.results[0].has_error;

const findCouponIndexById = couponId =>
  coupons.results.findIndex(coupon => coupon.id === couponId);

const rewire = () => {
  EcommerceApiService.fetchCouponOrders = () => Promise.resolve({
    data: coupons,
  });

  EcommerceApiService.fetchCouponDetails = couponId => Promise.resolve({
    data: coupons.results[findCouponIndexById(couponId)].has_error ?
      codes(firstCouponHasError) : codes(),
  });
};

export default rewire;
