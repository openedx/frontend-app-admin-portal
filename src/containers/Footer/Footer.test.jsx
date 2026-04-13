import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { configuration } from '../../config';

import Footer from './index';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

const mockStore = configureMockStore([thunk]);

const FooterWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Footer
        store={props.store}
        {...props}
      />
    </IntlProvider>
  </MemoryRouter>
);

FooterWrapper.propTypes = {
  store: PropTypes.shape({}).isRequired,
};

describe('<Footer />', () => {
  it('has no accessibility violations', async () => {
    const store = mockStore({ portalConfiguration: { enterpriseName: 'Test', enterpriseSlug: 'test', enterpriseBranding: { logo: 'http://test.url/1.png' } } });
    const { container } = render(<FooterWrapper store={store} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  let store;
  let tree;

  it('renders enterprise logo correctly', () => {
    store = mockStore({
      portalConfiguration: {
        enterpriseName: 'Test Enterprise',
        enterpriseSlug: 'test-enterprise',
        enterpriseBranding: {
          logo: 'https://test.url/image/1.png',
        },
      },
    });

    tree = renderer
      .create((
        <FooterWrapper store={store} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders edX logo correctly', () => {
    store = mockStore({
      portalConfiguration: {},
    });
    tree = renderer
      .create((
        <FooterWrapper store={store} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correct help center link from config', () => {
    configuration.ENTERPRISE_SUPPORT_URL = 'http://test-hc.com/hc';
    store = mockStore({
      portalConfiguration: {},
    });
    tree = renderer
      .create((
        <FooterWrapper store={store} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
