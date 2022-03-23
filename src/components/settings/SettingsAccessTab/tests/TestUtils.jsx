import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import PropTypes from 'prop-types';

import SettingsContextProvider from '../../SettingsContext';

const mockStore = configureMockStore();

const ENTERPRISE_ID = 'test-enterprise';
const NET_DAYS_UNTIL_EXPIRATION = 100;

export const MOCK_CONSTANTS = {
  ENTERPRISE_ID,
  NET_DAYS_UNTIL_EXPIRATION,
};

const basicStore = {
  portalConfiguration: {
    enterpriseId: ENTERPRISE_ID,
    enableUniversalLink: true,
  },
};

/**
 * Generates Store from `basicStore`
 * @param {portalConfiguration: Object, coupons: Object} Object custom store data
 * @returns {Object} Generated store
 */
export const generateStore = ({
  portalConfiguration,
  coupons,
}) => (mockStore({
  ...basicStore,
  portalConfiguration: {
    ...basicStore.portalConfiguration,
    ...portalConfiguration,
  },
  coupons: {
    loading: false,
    ...coupons,
  },
}));

// eslint-disable-next-line react/prop-types
const MockSettingsContext = ({ store, children }) => (
  <Provider store={store}>
    <SettingsContextProvider>
      {children}
    </SettingsContextProvider>
  </Provider>
);

MockSettingsContext.propTypes = {
  children: PropTypes.node.isRequired,
  store: PropTypes.shape(),
};

MockSettingsContext.defaultProps = {
  store: basicStore,
};

export default MockSettingsContext;
