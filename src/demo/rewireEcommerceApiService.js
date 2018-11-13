import EcommerceApiService from '../../src/data/services/EcommerceApiService';

import { codes, coupons } from './data';

const firstCouponHasError = coupons.results[0].hasError;

const findCouponIndexById = couponId =>
  coupons.results.findIndex(coupon => coupon.id === couponId);

const rewire = () => {
  EcommerceApiService.fetchCouponOrders = () => Promise.resolve({
    data: coupons,
  });

  EcommerceApiService.fetchCouponDetails = couponId => Promise.resolve({
    data: coupons.results[findCouponIndexById(couponId)].hasError ?
      codes(firstCouponHasError) : codes(),
  });
};

export default rewire;
