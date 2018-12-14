import { connect } from 'react-redux';

import CodeAssignmentModal from '../../components/CodeAssignmentModal';

import { sendCodeAssignment } from '../../data/actions/codeAssignment';

const mapStateToProps = state => ({
  loading: state.coupons.loading,
  error: state.coupons.error,
  enterpriseId: state.portalConfiguration.enterpriseId,
  coupons: state.coupons.data,
});

const mapDispatchToProps = dispatch => ({
  sendCodeAssignment: () => {
    dispatch(sendCodeAssignment());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeAssignmentModal);
