import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Header from './index';

const mockStore = configureMockStore([thunk]);

const HeaderWrapper = props => (
  <MemoryRouter>
    <Header
      store={props.store}
      {...props}
    />
  </MemoryRouter>
);

HeaderWrapper.propTypes = {
  store: PropTypes.shape({}).isRequired,
};

describe('<Header />', () => {
  let store;
  let tree;

  it('renders enterprise logo correctly', () => {
    store = mockStore({
      portalConfiguration: {
        enterpriseSlug: 'test-enterprise',
        enterpriseLogo: 'https://test.url/image/1.png',
      },
    });

    tree = renderer
      .create((
        <HeaderWrapper store={store} />
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
        <HeaderWrapper store={store} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
