import React from 'react';

import { useParams, useLocation, useNavigate } from 'react-router-dom';

export const withParams = WrappedComponent => {
  const WithParamsComponent = props => <WrappedComponent {...useParams()} {...props} />;
  return WithParamsComponent;
};

export const withLocation = Component => {
  const WrappedComponent = props => {
    const location = useLocation();
    return <Component location={location} {...props} />;
  };
  return WrappedComponent;
};

export const withNavigate = Component => {
  const WrappedComponent = props => {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
  return WrappedComponent;
};
