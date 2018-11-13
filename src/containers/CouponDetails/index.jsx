import { connect } from 'react-redux';

import CouponDetails from '../../components/CouponDetails';

const mapStateToProps = state => ({
  couponDetailsTable: state.table['coupon-details'],
});

export default connect(mapStateToProps)(CouponDetails);
