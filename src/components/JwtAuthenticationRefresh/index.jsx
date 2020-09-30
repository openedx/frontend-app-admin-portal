import { useState } from 'react';
import apiClient from '../../data/apiClient';

const JwtAuthenticationRefresh = ({ children }) => {
  const [isTokenRefreshed, setIsTokenRefreshed] = useState(false);
  const accessToken = apiClient.getDecodedAccessToken();
  const isTokenExpired = apiClient.isAccessTokenExpired(accessToken);
  if (!isTokenExpired || isTokenRefreshed) {
    return children;
  }
  apiClient.refreshAccessToken().then(() => {
    setIsTokenRefreshed(true);
  });
  return null;
};

export default JwtAuthenticationRefresh;
