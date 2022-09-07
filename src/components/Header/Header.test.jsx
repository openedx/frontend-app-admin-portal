import React from 'react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import Header, { Logo } from './index';
import { configuration } from '../../config';
import Img from '../Img';

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

describe('<Logo />', () => {
  it('renders enterprise logo correctly', () => {
    const props = {
      enterpriseBranding: {
        logo: 'https://test.url/image/1.png',
      },
      enterpriseName: 'Test Enterprise',
    };

    const wrapper = mount(<Logo {...props} />);
    const logo = wrapper.find(Img);
    expect(logo.props().src).toEqual(props.enterpriseBranding.logo);
    expect(logo.props().alt).toEqual(`${props.enterpriseName} logo`);
  });

  it('renders edX logo correctly', () => {
    const wrapper = mount(<Logo />);
    const logo = wrapper.find(Img);
    expect(logo.props().src).toEqual(configuration.LOGO_URL);
    expect(logo.props().alt).toEqual('edX logo');
  });
});
