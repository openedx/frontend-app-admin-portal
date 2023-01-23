/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import PropTypes from 'prop-types';
import { TEST_ENTERPRISE_ID, TEST_ENTERPRISE_NAME, TEST_ENTERPRISE_SLUG } from './constants';

const mockStore = configureMockStore([thunk]);

/**
 * @param {Object} portalConfiguration - The initial state of the portal configuration.
 * @param {String} portalConfiguration.enterpriseSlug - The initial state of the enterprise slug.
 * @param {String} portalConfiguration.enterpriseName - The initial state of the enterprise name.
 * @param {String} portalConfiguration.enterpriseId - The initial state of the enterprise id.
 * @return {Object} initialStateValue - The initial state value of the context.
 */
export const initialStateValue = {
  portalConfiguration:
    {
      enterpriseSlug: TEST_ENTERPRISE_SLUG,
      enterpriseName: TEST_ENTERPRISE_NAME,
      enterpriseId: TEST_ENTERPRISE_ID,
    },
};

/**
 * @function
 * @param {Object} props
 * @param {React.ReactNode} props.children - The elements that the context provider will wrap and make the context available to.
 * @param {Object} props.initialState - The initial state of the context, this prop is optional and defaults to `initialStateValue` if not provided.
 * @return {React.FunctionComponent} - A functional component that provides context to its children.
 */
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
