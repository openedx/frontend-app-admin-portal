import { connect } from 'react-redux';

import CouponDetails from '../../components/CouponDetails';
import { fetchCouponOrder } from '../../data/actions/coupons';

const mapStateToProps = state => ({
  couponDetailsTable: state.table['coupon-details'],
  couponOverviewError: state.coupons.couponOverviewError,
  couponOverviewLoading: state.coupons.couponOverviewLoading,
});

const mapDispatchToProps = dispatch => ({
  fetchCouponOrder: (couponId) => {
    dispatch(fetchCouponOrder(couponId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CouponDetails);
