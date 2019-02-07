import { connect } from 'react-redux';

import CodeRevokeModal from '../../components/CodeRevokeModal';

import sendCodeRevoke from '../../data/actions/codeRevoke';

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

export default connect(null, mapDispatchToProps)(CodeRevokeModal);
