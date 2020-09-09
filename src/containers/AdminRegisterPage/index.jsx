import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import AdminRegisterPage from '../../components/AdminRegisterPage';

const mapStateToProps = state => ({
  authentication: state.authentication,
  userAccount: state.userAccount,
});

export default withRouter(connect(mapStateToProps)(AdminRegisterPage));
