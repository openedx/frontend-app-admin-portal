import Cookies from 'universal-cookie';
import jwtDecode from 'jwt-decode';
import qs from 'query-string';

import configuration from '../../config';
import httpClient from '../../httpClient';

const cookies = new Cookies();
const accessTokenCookieName = configuration.ACCESS_TOKEN_COOKIE_NAME;
const baseUrl = configuration.LMS_BASE_URL;
const basePath = '/user_api/v1/account/';
const loginEndpoint = `${baseUrl}${basePath}login_session/`;
const logoutEndpoint = `${baseUrl}${basePath}logout_session/`;
const refreshAccessTokenEndpoint = `${baseUrl}${basePath}refresh_access_token/`;

class AuthService {
  static authUrls = [
    loginEndpoint,
    logoutEndpoint,
    refreshAccessTokenEndpoint,
  ];

  static login(email, password) {
    return httpClient.get(loginEndpoint)
      .then((response) => {
        return httpClient.post(
          loginEndpoint,
          qs.stringify({
            email,
            password,
          }),
        );
      });
  }

  static logout() {
    return httpClient.post(logoutEndpoint);
  }

  static isAccessTokenExpired() {
    try {
      let token = jwtDecode(cookies.get(accessTokenCookieName));
      if (token.exp < Date.now() / 1000) {
        return true;
      }
    } catch(error) {}
    return false;
  }

  static refreshAccessToken() {
    return httpClient.post(refreshAccessTokenEndpoint)
      .catch(error => {
        return new Promise((resolve, reject) => {
          reject(new Error('Failed to refresh access token.'));
        });
      });
  }
}

export default AuthService;
