import { connect } from 'react-redux';

import AddUsersModel from '../../components/AddUsersModal';

import addLicensesForUsers from '../../data/actions/userSubscription';

const mapStateToProps = state => ({
  initialValues: state.emailTemplate.subscribe,
});

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

export default connect(mapStateToProps, mapDispatchToProps)(AddUsersModel);
