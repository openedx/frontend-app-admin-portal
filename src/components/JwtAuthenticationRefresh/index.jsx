import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const JwtAuthenticationRefresh = ({
  isAuthenticated,
  children,
}) => {
  const apiClient = getAuthenticatedHttpClient();
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
