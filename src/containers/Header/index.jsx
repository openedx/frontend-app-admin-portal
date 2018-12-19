import { connect } from 'react-redux';
import { fetchUserProfile } from '@edx/frontend-auth';

import apiClient from '../../data/apiClient';
import Header from '../../components/Header';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseLogo: state.portalConfiguration.enterpriseLogo,
  email: state.userProfile.email,
  username: state.authentication.username,
  userProfileImageUrl: state.userProfile.userProfileImageUrl,
  hasSidebarToggle: state.sidebar.hasSidebarToggle,
});

const mapDispatchToProps = dispatch => ({
  fetchUserProfile: username => dispatch(fetchUserProfile(apiClient, username)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
