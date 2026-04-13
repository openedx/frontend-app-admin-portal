import React from 'react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { axe } from 'jest-axe';
import Header, { Logo } from './index';
import { configuration } from '../../config';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

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
  it('has no accessibility violations', async () => {
    const { container } = render(<Logo />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders enterprise logo correctly', async () => {
    const props = {
      enterpriseLogo: 'https://test.url/image/1.png',
      enterpriseName: 'Test Enterprise',
    };

    render(<Logo {...props} />);
    const logo = await screen.findByTestId('header-logo-img');
    expect(logo).toHaveAttribute('src', props.enterpriseLogo);
    expect(logo).toHaveAttribute('alt', `${props.enterpriseName} logo`);
  });

  it('renders edX logo correctly', async () => {
    render(<Logo />);
    const logo = await screen.findByTestId('header-logo-img');
    expect(logo).toHaveAttribute('src', configuration.LOGO_URL);
    expect(logo).toHaveAttribute('alt', 'edX logo');
  });
});
