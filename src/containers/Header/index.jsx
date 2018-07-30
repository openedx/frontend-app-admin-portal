import { connect } from 'react-redux';
import Header from '../../components/Header';

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseLogo: state.portalConfiguration.enterpriseLogo,
  email: state.authentication.email,
});

export default connect(mapStateToProps)(Header);
