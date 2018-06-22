import { connect } from 'react-redux';
import LoginForm from '../../components/LoginForm';
import login from '../../data/actions/loginForm';

const mapStateToProps = state => ({
  loading: state.login.loading,
  isAuthenticated: state.login.isAuthenticated,
  error: state.login.error,
});

const mapDispatchToProps = dispatch => ({
  login: (email, password) => dispatch(login(email, password)),
});

const LoginPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginForm);

export default LoginPage;
