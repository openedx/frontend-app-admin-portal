import { connect } from 'react-redux';

import LogoutHandler from '../../components/LogoutHandler';

import { logout } from '../../data/actions/authentication';
import { clearPortalConfiguration } from '../../data/actions/portalConfiguration';

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
  clearPortalConfiguration: () => dispatch(clearPortalConfiguration()),
});

export default connect(null, mapDispatchToProps)(LogoutHandler);
