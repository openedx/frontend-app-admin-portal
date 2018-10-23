import axios from 'axios';

import store from './data/store';
import { logout } from './data/actions/authentication';

const httpClient = axios;

// Configure axios with response interceptor
httpClient.interceptors.response.use(response => response, (error) => {
  const errorStatus = error && error.response && error.response.status;
  if (errorStatus === 401 || errorStatus === 403) {
    store.dispatch(logout());
  }
  return Promise.reject(error);
});

export default httpClient;
