import EcommerceApiService from '../../src/data/services/EcommerceApiService';

import { codes, codesCsv, coupons} from './data';

const firstCouponHasError = coupons[0].has_error;

const findCouponIndexById = couponId =>
  coupons.findIndex(coupon => coupon.id === couponId);

const rewire = () => {
  const fetchData = (options = {page_size: 10, page: 1}, couponData) => {
    const pageSize = 10; //options.page_size;
    const page = options.page;
    const start = (page - 1) * pageSize;

    const results = couponData.slice(start, start + pageSize);
    return Promise.resolve({
      data: {
        count: couponData.length,
        num_pages: Math.ceil(couponData.length / pageSize),
        current_page: page,
        results,
      },
    });
  };
  EcommerceApiService.fetchCouponOrders = options => fetchData(options, coupons);

  EcommerceApiService.fetchCouponDetails = (couponId, options, { csv } = {}) => {
    if (csv) {
      return Promise.resolve({
        data: codesCsv(),
      });
    }
    let couponData = coupons[findCouponIndexById(couponId)].has_error ?
      codes(firstCouponHasError) : codes()
    return fetchData(options, couponData)
  }
};

export default rewire;
