import React from 'react';
import PropTypes from 'prop-types';

import NewRelicService from '../../data/services/NewRelicService';

class ErrorBoundary extends React.Component {
  componentDidCatch(error) {
    NewRelicService.logError(error);
  }

  render() {
    return this.props.children;
  }
}

export const withErrorBoundary = WrappedComponent => props => (
  <ErrorBoundary>
    <WrappedComponent {...props} />
  </ErrorBoundary>
);

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
