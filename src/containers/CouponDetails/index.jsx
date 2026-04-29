import { connect } from 'react-redux';

import CouponDetails from '../../components/CouponDetails';

import { fetchCouponOrder } from '../../data/actions/coupons';

// CouponDetails now manages table data locally via direct API calls, so
// couponDetailsTable is no longer injected from the Redux store.
const mapStateToProps = state => ({
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
