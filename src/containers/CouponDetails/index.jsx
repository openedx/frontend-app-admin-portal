import { connect } from 'react-redux';

import CouponDetails from '../../components/CouponDetails';

import { fetchCouponOrder } from '../../data/actions/coupons';

const couponDetailsTableId = 'coupon-details';

const mapStateToProps = state => ({
  couponDetailsTable: state.table[couponDetailsTableId],
  couponOverviewError: state.coupons.couponOverviewError,
  couponOverviewLoading: state.coupons.couponOverviewLoading,
});

const mapDispatchToProps = dispatch => ({
  fetchCouponOrder: (couponId) => {
    dispatch(fetchCouponOrder(couponId));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CouponDetails);
