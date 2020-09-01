import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import AdminRegisterPage from '../../components/AdminRegisterPage';

const mapStateToProps = state => ({
  isAuthenticated: !!state.authentication?.username,
});

export default withRouter(connect(mapStateToProps)(AdminRegisterPage));
