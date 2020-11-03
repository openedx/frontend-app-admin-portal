import { connect } from 'react-redux';

import CodeAssignmentModal from '../../components/CodeAssignmentModal';

import sendCodeAssignment from '../../data/actions/codeAssignment';
import { EMAIL_TEMPLATE_SOURCE_NEW_EMAIL } from '../../data/constants/emailTemplate';

const mapStateToProps = (state) => {
  let initialValues = state.emailTemplate.emailTemplateSource === EMAIL_TEMPLATE_SOURCE_NEW_EMAIL ?
    state.emailTemplate.default.assign : state.emailTemplate.assign;

  // By default `Automate reminders` are enabled for code assignments
  initialValues = { ...initialValues, 'enable-nudge-emails': true };

  return {
    couponDetailsTable: state.table['coupon-details'],
    initialValues,
    enableReinitialize: true,
  };
};

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
