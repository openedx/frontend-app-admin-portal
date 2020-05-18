import { connect } from 'react-redux';

import AddUsersModel from '../../components/AddUsersModal';

import subscribeUsers from '../../data/actions/userSubscription';
import {
  clearSubscriptionDetails,
  fetchSubscriptionDetails,
} from '../../data/actions/subscriptionDetails';

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  initialValues: state.emailTemplate.subscribe,
  availableSubscriptionCount: state.subscriptionDetails.licenses.available,
});

const mapDispatchToProps = dispatch => ({
  fetchSubscriptionDetails: (enterpriseId) => {
    dispatch(fetchSubscriptionDetails(enterpriseId));
  },
  clearSubscriptionDetails: () => {
    dispatch(clearSubscriptionDetails());
  },

  subscribeUsers: payload => new Promise((resolve, reject) => {
    dispatch(subscribeUsers({
      payload,
      onSuccess: (response) => { resolve(response); },
      onError: (error) => { reject(error); },
    }));
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddUsersModel);
