import { connect } from 'react-redux';

import CodeReminderModal from '../../components/CodeReminderModal';

import sendCodeReminder from '../../data/actions/codeReminder';
import { EMAIL_TEMPLATE_SOURCE_NEW_EMAIL } from '../../data/constants/emailTemplate';

const mapStateToProps = state => ({
  couponDetailsTable: state.table['coupon-details'],
  initialValues: state.emailTemplate.emailTemplateSource === EMAIL_TEMPLATE_SOURCE_NEW_EMAIL
    ? state.emailTemplate.default.remind : state.emailTemplate.remind,
  enableReinitialize: true,
});

const mapDispatchToProps = dispatch => ({
  sendCodeReminder: (couponId, options) => new Promise((resolve, reject) => {
    dispatch(sendCodeReminder({
      couponId,
      options,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeReminderModal);
