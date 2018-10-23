import { connect } from 'react-redux';
import LoginForm from '../../components/LoginForm';
import { login } from '../../data/actions/authentication';

const mapStateToProps = state => ({
  loading: state.authentication.loading,
  isAuthenticated: state.authentication.isAuthenticated,
  error: state.authentication.error,
});

const mapDispatchToProps = dispatch => ({
  login: (email, password) => dispatch(login(email, password)),
});

const LoginPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginForm);

export default LoginPage;
