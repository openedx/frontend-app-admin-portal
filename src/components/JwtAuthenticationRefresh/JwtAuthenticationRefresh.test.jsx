import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  act,
  render,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import JwtAuthenticationRefresh from './index';

const mockStore = configureMockStore([thunk]);

const mockApiClient = {
  getDecodedAccessToken: jest.fn(),
  isAccessTokenExpired: jest.fn(),
  refreshAccessToken: jest.fn().mockResolvedValue(),
};

getAuthenticatedHttpClient.mockReturnValue(mockApiClient);

const WrappedJwtAuthenticationRefresh = (props) => (
  <Provider {...props}>
    <JwtAuthenticationRefresh>
      <div>Refreshing jwt token...</div>
    </JwtAuthenticationRefresh>
  </Provider>
);

describe('<JwtAuthenticationRefresh />', () => {
  afterEach(() => jest.clearAllMocks());

  it('calls refreshAccessToken when not authenticated', async () => {
    await act(async () => render(
      <WrappedJwtAuthenticationRefresh store={mockStore()} />,
    ));
    expect(mockApiClient.refreshAccessToken).toHaveBeenCalled();
  });

  it('calls refreshAccessToken when token is expired', async () => {
    mockApiClient.isAccessTokenExpired.mockReturnValue(true);

    await act(async () => render(
      <WrappedJwtAuthenticationRefresh
        store={mockStore({
          authentication: {
            username: 'username',
          },
        })}
      />,
    ));
    expect(mockApiClient.refreshAccessToken).toHaveBeenCalled();
  });

  it('does not call refreshAccessToken when authenticated and token is not expired', async () => {
    mockApiClient.isAccessTokenExpired.mockReturnValue(false);

    await act(async () => render(
      <WrappedJwtAuthenticationRefresh
        store={mockStore({
          authentication: {
            username: 'username',
          },
        })}
      />,
    ));
    expect(mockApiClient.refreshAccessToken).not.toHaveBeenCalled();
  });
});
