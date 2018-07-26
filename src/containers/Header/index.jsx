import { connect } from 'react-redux';
import { logout } from '../../data/actions/authentication';

import Header from '../../components/Header';

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseLogo: state.portalConfiguration.enterpriseLogo,
  email: state.authentication.email,
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
});


export default connect(mapStateToProps, mapDispatchToProps)(Header);
