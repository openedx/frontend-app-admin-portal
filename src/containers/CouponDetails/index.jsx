import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CouponDetails from '../../components/CouponDetails';

import { fetchCouponOrder } from '../../data/actions/coupons';
import updateCodeVisibility from '../../data/actions/codeVisibility';

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
  updateCodeVisibility: (couponId, codeIds, isPublic) => {
    dispatch(updateCodeVisibility(couponId, codeIds, isPublic));
  },
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(CouponDetails));
