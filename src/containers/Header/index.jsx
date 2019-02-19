import { connect } from 'react-redux';
import { fetchUserAccount, UserAccountApiService } from '@edx/frontend-auth';

import apiClient from '../../data/apiClient';
import Header from '../../components/Header';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseLogo: state.portalConfiguration.enterpriseLogo,
  email: state.userAccount.email,
  username: state.authentication.username,
  userProfileImageUrl: state.userAccount.profileImage.imageUrlMedium,
  hasSidebarToggle: state.sidebar.hasSidebarToggle,
});

const mapDispatchToProps = (dispatch) => {
  const userAccountApiService = new UserAccountApiService(apiClient, process.env.LMS_BASE_URL);
  return {
    fetchUserAccount: username => dispatch(fetchUserAccount(userAccountApiService, username)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
