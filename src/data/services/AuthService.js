import qs from 'query-string';

import configuration from '../../config';
import httpClient from '../../httpClient';

class AuthService {
  static baseUrl = configuration.LMS_BASE_URL;
  static clientId = configuration.LMS_CLIENT_ID;

  static login(email, password) {
    return httpClient.get(`${this.baseUrl}/user_api/v1/account/login_session/`)
      .then((response) => {
        return httpClient.post(
          `${this.baseUrl}/user_api/v1/account/login_session/`,
          qs.stringify({
            email,
            password,
          }),
        );
      });
  }

  static logout() {
    return httpClient.post(`${this.baseUrl}/user_api/v1/account/logout_session/`);
  }
}

export default AuthService;
