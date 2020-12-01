import { connect } from 'react-redux';

import CodeRevokeModal from '../../components/CodeRevokeModal';

import sendCodeRevoke from '../../data/actions/codeRevoke';
import { EMAIL_TEMPLATE_SOURCE_NEW_EMAIL } from '../../data/constants/emailTemplate';

const mapStateToProps = (state) => {
  let initialValues = state.emailTemplate.emailTemplateSource === EMAIL_TEMPLATE_SOURCE_NEW_EMAIL
    ? state.emailTemplate.default.revoke : state.emailTemplate.revoke;

  initialValues = { ...initialValues, 'do-not-email': false };

  return {
    initialValues,
    enableReinitialize: true,
  };
};

const mapDispatchToProps = dispatch => ({
  sendCodeRevoke: (couponId, options) => new Promise((resolve, reject) => {
    dispatch(sendCodeRevoke({
      couponId,
      options,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeRevokeModal);
