import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';

function loginRequired(component, redirectPath = '/start_login') {
  return connectedRouterRedirect({
    redirectPath: redirectPath,
    authenticatedSelector: state => state.user.isLoggedIn
  })(component);
}

export { loginRequired };
