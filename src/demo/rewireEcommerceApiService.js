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

  EcommerceApiService.fetchCouponDetails = couponId => Promise.resolve({
    data: 'assigned_to,code,redeem_url,redemptions.available,redemptions.used\r\n,UMY3Z5ZUOUQMFYLX,https://testserver.fake/coupons/offer/?code=UMY3Z5ZUOUQMFYLX,3,3\r\n,UMY3Z5ZUOUQMFYLX,https://testserver.fake/coupons/offer/?code=UMY3Z5ZUOUQMFYLX,3,3\r\n,UMY3Z5ZUOUQMFYLX,https://testserver.fake/coupons/offer/?code=UMY3Z5ZUOUQMFYLX,3,3\r\n,UNKA23D6Y2MC5Z6C,https://testserver.fake/coupons/offer/?code=UNKA23D6Y2MC5Z6C,3,3\r\n,UNKA23D6Y2MC5Z6C,https://testserver.fake/coupons/offer/?code=UNKA23D6Y2MC5Z6C,3,3\r\n,UNKA23D6Y2MC5Z6C,https://testserver.fake/coupons/offer/?code=UNKA23D6Y2MC5Z6C,3,3\r\n',
  });
};

export default rewire;
