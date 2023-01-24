/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import PropTypes from 'prop-types';
import { BaseContext, initialStateValue as baseInitialStateValues } from '../context';
import { EnterpriseAppContext as NestedEnterpriseAppContext } from '../../../components/EnterpriseApp/EnterpriseAppContextProvider';

/**
 * @param {Object} enterpriseCuration - The initial state of the enterpriseCuration.
 * @param {Object} enterpriseCuration.enterpriseCuration - The initial state of the enterpriseCuration.
 * @param {Array} enterpriseCuration.enterpriseCuration.highlightSets - The initial state of the highlightSets.
 * @return {Object} initialStateValue - The initial state value of the context.
 */
export const initialStateValue = {
  enterpriseCuration: {
    enterpriseCuration: {
      highlightSets: [],
    },
  },
};

/**
 * @function
 * @param {Object} props
 * @param {React.ReactNode} props.children - The elements that the context provider will wrap and make the context available to.
 * @param {Object} props.initialBaseState - The initial state of the `BaseContext` context provider, this prop is optional and defaults to `baseInitialStateValues` if not provided.
 * @param {Object} props.value - The value that will be passed down to the context, this prop is optional and defaults to `initialStateValue` if not provided.
 * @param {Object} props.enterpriseAppContextValue - The value that will be passed down to the `NestedEnterpriseAppContext` context provider.
 * @return {React.FunctionComponent} - A functional component that provides context to its children.
 */
export const EnterpriseAppContext = ({
  children,
  initialBaseState,
  value,
  enterpriseAppContextValue,
}) => (
  <BaseContext initialState={enterpriseAppContextValue?.initialBaseState || initialBaseState}>
    <NestedEnterpriseAppContext.Provider value={enterpriseAppContextValue?.value || value}>
      {children}
    </NestedEnterpriseAppContext.Provider>
  </BaseContext>
);

EnterpriseAppContext.propTypes = {
  children: PropTypes.node.isRequired,
  initialBaseState: PropTypes.shape({
    portalConfiguration: PropTypes.shape({
      enterpriseSlug: PropTypes.string,
      enterpriseName: PropTypes.string,
      enterpriseId: PropTypes.string,
    }),
  }),
  value: PropTypes.shape(),
  enterpriseAppContextValue: PropTypes.shape({
    initialBaseState: PropTypes.shape(),
    value: PropTypes.shape(),
  }),
};

EnterpriseAppContext.defaultProps = {
  initialBaseState: baseInitialStateValues,
  value: initialStateValue,
  enterpriseAppContextValue: null,
};
