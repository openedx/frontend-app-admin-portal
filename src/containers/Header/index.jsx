import { connect } from 'react-redux';
import Header from '../../components/Header';
import fetchUserProfile from '../../data/actions/userProfile';

const mapStateToProps = state => ({
  enterpriseName: state.portalConfiguration.enterpriseName,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseLogo: state.portalConfiguration.enterpriseLogo,
  email: state.authentication.email,
  username: state.authentication.username,
  userProfile: state.userProfile.profile,
});

const mapDispatchToProps = dispatch => ({
  fetchUserProfile: username => dispatch(fetchUserProfile(username)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
