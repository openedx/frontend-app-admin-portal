import React from 'react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

import Header, { Logo } from './index';
import { configuration } from '../../config';

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
      enterpriseLogo: 'https://test.url/image/1.png',
      enterpriseName: 'Test Enterprise',
    };

    render(<Logo {...props} />);
    const logo = screen.getByTestId('img');
    expect(logo.src).toEqual(props.enterpriseLogo);
    expect(logo.alt).toEqual(`${props.enterpriseName} logo`);
  });

  it('renders edX logo correctly', () => {
    render(<Logo />);
    const logo = screen.getByTestId('img');
    expect(logo.src).toEqual(configuration.LOGO_URL);
    expect(logo.alt).toEqual('edX logo');
  });
});
