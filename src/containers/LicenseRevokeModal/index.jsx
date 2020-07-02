import { connect } from 'react-redux';

import LicenseRevokeModal from '../../components/LicenseRevokeModal';
import sendLicenseRevoke from '../../data/actions/licenseRevoke';

const mapDispatchToProps = dispatch => ({
  sendLicenseRevoke: (subscriptionUUID, options) => new Promise((resolve, reject) => {
    dispatch(sendLicenseRevoke({
      subscriptionUUID,
      options,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(null, mapDispatchToProps)(LicenseRevokeModal);
