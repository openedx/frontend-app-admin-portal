import { connect } from 'react-redux';
import LoginForm from '../../components/LoginForm';
import { login } from '../../data/actions/authentication';
import { fetchUserProfile } from '../../data/actions/userProfile';

const mapStateToProps = state => ({
  loading: state.authentication.loading,
  isAuthenticated: state.authentication.isAuthenticated,
  error: state.authentication.error,
  userProfile: state.userProfile.profile,
});

const mapDispatchToProps = dispatch => ({
  login: (email, password) => dispatch(login(email, password)),
  fetchUserProfile: username => dispatch(fetchUserProfile(username)),
});

const LoginPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginForm);

export default LoginPage;
