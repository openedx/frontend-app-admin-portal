import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import apiClient from '../../data/apiClient';

const JwtAuthenticationRefresh = ({
  isAuthenticated,
  children,
}) => {
  const [isRefreshingJWT, setIsRefreshingJWT] = useState(true);
  useEffect(
    () => {
      const accessToken = apiClient.getDecodedAccessToken();
      const isTokenExpired = apiClient.isAccessTokenExpired(accessToken);

      if (!isAuthenticated || (isAuthenticated && isTokenExpired)) {
        apiClient.refreshAccessToken().finally(() => setIsRefreshingJWT(false));
      } else {
        setIsRefreshingJWT(false);
      }
    },
    [isAuthenticated],
  );
  if (isRefreshingJWT) {
    return null;
  }
  return children;
};
const mapStateToProps = state => ({
  isAuthenticated: !!state.authentication?.username,
});
export default connect(mapStateToProps)(JwtAuthenticationRefresh);
