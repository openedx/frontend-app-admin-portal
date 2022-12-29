import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { configuration } from '../../config';

import Footer from './index';

const mockStore = configureMockStore([thunk]);

const FooterWrapper = (props) => (
  <MemoryRouter>
    <Footer
      store={props.store}
      {...props}
    />
  </MemoryRouter>
);

FooterWrapper.propTypes = {
  store: PropTypes.shape({}).isRequired,
};

describe('<Footer />', () => {
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
