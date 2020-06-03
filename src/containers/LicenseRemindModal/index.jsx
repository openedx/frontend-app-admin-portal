import { connect } from 'react-redux';

import LicenseRemindModal from '../../components/LicenseRemindModal';
import sendLicenseReminder from '../../data/actions/LicenseReminder';

const mapDispatchToProps = dispatch => ({
  sendLicenseReminder: options => new Promise((resolve, reject) => {
    dispatch(sendLicenseReminder({
      options,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(null, mapDispatchToProps)(LicenseRemindModal);
