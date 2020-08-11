import { connect } from 'react-redux';

import AddUsersModal from '../../components/AddUsersModal';

import addLicensesForUsers from '../../data/actions/userSubscription';

const mapDispatchToProps = dispatch => ({
  addLicensesForUsers: (options, subscriptionUUID) => new Promise((resolve, reject) => {
    dispatch(addLicensesForUsers({
      options,
      subscriptionUUID,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(null, mapDispatchToProps)(AddUsersModal);
