import { connect } from 'react-redux';

import LicenseRemindModal from '../../components/LicenseRemindModal';
import sendLicenseReminder from '../../data/actions/LicenseReminder';

const mapStateToProps = state => ({
  contactEmail: state.portalConfiguration.contactEmail,
});

const mapDispatchToProps = dispatch => ({
  sendLicenseReminder: (options, subscriptionUUID, bulkRemind) => new Promise((resolve, reject) => {
    dispatch(sendLicenseReminder({
      options,
      subscriptionUUID,
      bulkRemind,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(LicenseRemindModal);
