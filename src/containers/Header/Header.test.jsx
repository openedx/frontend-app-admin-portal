import React from 'react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

import { getAuthenticatedUser, hydrateAuthenticatedUser } from '@edx/frontend-platform/auth';
import Header from './index';

import { configuration } from '../../config';

const mockStore = configureMockStore([thunk]);

const HeaderWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <Header
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
  hydrateAuthenticatedUser: jest.fn(),
}));

HeaderWrapper.propTypes = {
  store: PropTypes.shape({}).isRequired,
};

describe('<Header />', () => {
  let store;

  afterEach(() => {
    hydrateAuthenticatedUser.mockClear();
    getAuthenticatedUser.mockClear();
  });

  it('renders enterprise logo correctly', () => {
    getAuthenticatedUser.mockReturnValue({
      email: 'test@example.com',
      username: null,
      profileImage: {
        imageUrlMedium: null,
      },
    });
    const storeData = {
      portalConfiguration: {
        enterpriseName: 'Test Enterprise',
        enterpriseSlug: 'test-enterprise',
        enterpriseBranding: {
          logo: 'https://test.url/image/1.png',
        },
      },
      sidebar: {},
    };
    store = mockStore({ ...storeData });

    render(<HeaderWrapper store={store} />);
    const logo = screen.getByTestId('img');

    expect(logo.src).toEqual(storeData.portalConfiguration.enterpriseBranding.logo);
    expect(logo.alt).toEqual(`${storeData.portalConfiguration.enterpriseName} logo`);
  });

  it('renders edX logo correctly', () => {
    getAuthenticatedUser.mockReturnValue({});
    store = mockStore({
      portalConfiguration: {},
      sidebar: {},
    });
    render(<HeaderWrapper store={store} />);
    // testing the Img rather than Logo because Logo's props will be undefined
    const logo = screen.getByTestId('img');
    expect(logo.src).toEqual(configuration.LOGO_URL);
    expect(logo.alt).toEqual('edX logo');
  });

  it('renders profile image correctly', () => {
    const userData = {
      email: 'staff@example.com',
      username: 'staff',
      profileImage: {
        hasImage: true,
        imageUrlMedium: 'https://test.url/image/1.png',
      },
    };
    getAuthenticatedUser.mockReturnValue(userData);
    store = mockStore({
      portalConfiguration: {
        enterpriseSlug: 'test-enterprise',
      },
      sidebar: {},
    });
    render(<HeaderWrapper store={store} />);

    expect(screen.getAllByRole('img')[1]).toBeTruthy();
    const userImg = screen.getAllByRole('img')[1];
    expect(userImg.src).toEqual(userData.profileImage.imageUrlMedium);
    expect(screen.getByRole('button').getAttribute('alt')).toContain(userData.username);
  });

  it('does not render profile image or dropdown if unauthenticated', () => {
    getAuthenticatedUser.mockReturnValue(null);
    store = mockStore({
      portalConfiguration: {},
      sidebar: {},
    });
    render(<HeaderWrapper store={store} />);
    expect(screen.queryAllByText('Logout')).toHaveLength(0);
  });

  it('does not call hydrate if not authenticated', () => {
    getAuthenticatedUser.mockReturnValue(null);
    store = mockStore({
      portalConfiguration: {},
      sidebar: {},
    });

    render(<HeaderWrapper store={store} />);
    expect(hydrateAuthenticatedUser.mock.calls.length).toBe(0);
  });

  describe('renders sidebar toggle correctly', () => {
    getAuthenticatedUser.mockReturnValue({
      profileImage: {
        imageUrlMedium: null,
      },
    });
    it('does not show toggle', () => {
      store = mockStore({
        portalConfiguration: {},
        sidebar: {
          hasSidebarToggle: false,
          isExpandedByToggle: false,
        },
      });
      render(<HeaderWrapper store={store} />);
      expect(screen.queryAllByTestId('sidebar-toggle')).toHaveLength(0);
    });

    it('does show toggle', () => {
      getAuthenticatedUser.mockReturnValue({
        email: 'foo@foo.com',
        profileImage: {
          imageUrlMedium: null,
        },
      });
      store = mockStore({
        portalConfiguration: {},
        sidebar: {
          hasSidebarToggle: true,
          isExpandedByToggle: false,
        },
      });
      render(<HeaderWrapper store={store} />);
      expect(screen.getAllByTestId('sidebar-toggle')).toHaveLength(1);
    });
  });
});
