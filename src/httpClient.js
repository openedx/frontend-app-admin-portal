import axios from 'axios';

import store from './data/store';
import { logout } from './data/actions/authentication';
import AuthService from './data/services/AuthService';

axios.defaults.withCredentials = true;
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'sandbox-csrftoken';

const httpClient = axios;
let isRefreshingToken = false;
let refreshTokenSubscribers = [];

function publishTokenRefresh() {
  refreshTokenSubscribers = refreshTokenSubscribers.filter(cb => {
    cb();
    return false;
  });
}

function subscribeTokenRefresh(cb) {
  refreshTokenSubscribers.push(cb);
}

httpClient.interceptors.request.use((config) => {
  let originalRequest = config;
  let isAuthUrl = AuthService.authUrls.includes(originalRequest.url);
  if (!isAuthUrl && AuthService.isAccessTokenExpired()) {
    if (!isRefreshingToken) {
      isRefreshingToken = true;
      AuthService.refreshAccessToken()
        .then(() => {
          isRefreshingToken = false;
          publishTokenRefresh();
        })
        .catch(() => {
          store.dispatch(logout());
        });
    }

    return new Promise((resolve) => {
      subscribeTokenRefresh(() => {
        resolve(originalRequest);
      });
    });
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Configure axios with response interceptor
httpClient.interceptors.response.use(response => response, (error) => {
  const errorStatus = error && error.response && error.response.status;
  if (errorStatus === 401 || errorStatus === 403) {
    store.dispatch(logout());
  }
  return Promise.reject(error);
});

export default httpClient;
