import React from 'react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { getAuthenticatedUser, hydrateAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AvatarButton } from '@edx/paragon';
import Header from './index';
import { Logo, HeaderDropdown } from '../../components/Header';
import SidebarToggle from '../SidebarToggle';

import { configuration } from '../../config';
import Img from '../../components/Img';

const mockStore = configureMockStore([thunk]);

function HeaderWrapper(props) {
  return (
    <MemoryRouter>
      <Provider store={props.store}>
        <Header
          {...props}
        />
      </Provider>
    </MemoryRouter>
  );
}

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
        enterpriseLogo: 'https://test.url/image/1.png',
      },
      sidebar: {},
    };
    store = mockStore({ ...storeData });

    const wrapper = mount(<HeaderWrapper store={store} />);
    const logo = wrapper.find(Logo);

    expect(logo.props().enterpriseLogo).toEqual(storeData.portalConfiguration.enterpriseLogo);
    expect(logo.props().enterpriseName).toEqual(storeData.portalConfiguration.enterpriseName);
  });

  it('renders edX logo correctly', () => {
    getAuthenticatedUser.mockReturnValue({});
    store = mockStore({
      portalConfiguration: {},
      sidebar: {},
    });
    const wrapper = mount(<HeaderWrapper store={store} />);
    // testing the Img rather than Logo because Logo's props will be undefined
    const logo = wrapper.find(Img);
    expect(logo.props().src).toEqual(configuration.LOGO_URL);
    expect(logo.props().alt).toEqual('edX logo');
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
    const wrapper = mount(<HeaderWrapper store={store} />);
    const userImg = wrapper.find(AvatarButton);
    expect(userImg.props().src).toEqual(userData.profileImage.imageUrlMedium);
    expect(userImg.props().alt).toContain(userData.username);
  });

  it('does not render profile image or dropdown if unauthenticated', () => {
    getAuthenticatedUser.mockReturnValue(null);
    store = mockStore({
      portalConfiguration: {},
      sidebar: {},
    });
    const wrapper = mount(<HeaderWrapper store={store} />);
    expect(wrapper.find(HeaderDropdown).length).toEqual(0);
  });

  it('does not call hydrate if not authenticated', () => {
    getAuthenticatedUser.mockReturnValue(null);
    store = mockStore({
      portalConfiguration: {},
      sidebar: {},
    });

    mount(<HeaderWrapper store={store} />);
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
      const wrapper = mount(<HeaderWrapper store={store} />);
      expect(wrapper.find(SidebarToggle).length).toEqual(0);
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
      const wrapper = mount(<HeaderWrapper store={store} />);
      expect(wrapper.find(SidebarToggle).length).toEqual(1);
    });
  });
});
