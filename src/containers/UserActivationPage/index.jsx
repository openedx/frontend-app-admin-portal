import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { fetchUserAccount, UserAccountApiService } from '@edx/frontend-auth';

import apiClient from '../../data/apiClient';
import UserActivationPage from '../../components/UserActivationPage';

const mapStateToProps = state => ({
  authentication: state.authentication,
  userAccount: state.userAccount,
});

const mapDispatchToProps = (dispatch) => {
  const userAccountApiService = new UserAccountApiService(apiClient, process.env.LMS_BASE_URL);
  return {
    fetchUserAccount: username => dispatch(fetchUserAccount(userAccountApiService, username)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserActivationPage));
