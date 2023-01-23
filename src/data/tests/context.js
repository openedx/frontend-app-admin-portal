/* eslint-disable react/jsx-filename-extension */
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import PropTypes from 'prop-types';
import { TEST_ENTERPRISE_ID, TEST_ENTERPRISE_NAME, TEST_ENTERPRISE_SLUG } from './constants';

const mockStore = configureMockStore([thunk]);

export const initialStateValue = {
  portalConfiguration:
    {
      enterpriseSlug: TEST_ENTERPRISE_SLUG,
      enterpriseName: TEST_ENTERPRISE_NAME,
      enterpriseId: TEST_ENTERPRISE_ID,
    },
};

export const BaseContext = ({
  children,
  initialState,
}) => (
  <IntlProvider locale="en">
    <Provider store={mockStore(initialState)}>
      {children}
    </Provider>
  </IntlProvider>
);

BaseContext.propTypes = {
  children: PropTypes.node.isRequired,
  initialState: PropTypes.shape({
    portalConfiguration: PropTypes.shape({
      enterpriseSlug: PropTypes.string,
      enterpriseName: PropTypes.string,
      enterpriseId: PropTypes.string,
    }),
  }),
};

BaseContext.defaultProps = {
  initialState: initialStateValue,
};
