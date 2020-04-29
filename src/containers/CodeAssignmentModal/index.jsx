import { connect } from 'react-redux';

import CodeAssignmentModal from '../../components/CodeAssignmentModal';

import sendCodeAssignment from '../../data/actions/codeAssignment';

const mapStateToProps = state => ({
  couponDetailsTable: state.table['coupon-details'],
  initialValues: state.emailTemplate.default.assign,
});

const mapDispatchToProps = dispatch => ({
  sendCodeAssignment: (couponId, options) => new Promise((resolve, reject) => {
    dispatch(sendCodeAssignment({
      couponId,
      options,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeAssignmentModal);
