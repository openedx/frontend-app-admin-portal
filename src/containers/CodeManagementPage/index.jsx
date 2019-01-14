import { connect } from 'react-redux';

import CodeManagement from '../../components/CodeManagement';

import { fetchCouponOrders, clearCouponOrders } from '../../data/actions/coupons';

const mapStateToProps = state => ({
  loading: state.coupons.loading,
  error: state.coupons.error,
  enterpriseId: state.portalConfiguration.enterpriseId,
  coupons: state.coupons.data,
});

const mapDispatchToProps = dispatch => ({
  fetchCouponOrders: (options) => {
    dispatch(fetchCouponOrders(options));
  },
  clearCouponOrders: () => {
    dispatch(clearCouponOrders());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeManagement);
