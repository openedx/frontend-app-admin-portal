import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter, Route } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import EnterpriseApp from './index';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  dashboardAnalytics: {},
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
  courseEnrollments: {},
  table: {
    'enterprise-list': {},
  },
});

const AppWrapper = props => (
  <Provider store={store}>
    <Route
      path={props.path}
      component={() => (
        <EnterpriseApp {...props} />
      )}
    />
  </Provider>
);

AppWrapper.propTypes = {
  path: PropTypes.string.isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

describe('EnterpriseApp', () => {
  it('renders not found page correctly', () => {
    const tree = renderer
      .create((
        <MemoryRouter initialEntries={['/']}>
          <AppWrapper
            path="/"
            match={{
              url: '/',
              params: {
                enterpriseSlug: '',
              },
            }}
          />
        </MemoryRouter>))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('gets portalConfiguration when componentDidMount', () => {
    const enterpriseSlug = 'test-enterprise';
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    mount((
      <MemoryRouter initialEntries={[`/${enterpriseSlug}`]}>
        <AppWrapper
          path={`/${enterpriseSlug}`}
          match={{
            url: `/${enterpriseSlug}`,
            params: {
              enterpriseSlug,
            },
          }}
        />
      </MemoryRouter>
    ));
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
