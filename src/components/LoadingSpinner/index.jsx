import React from 'react';
import { FadeLoader } from 'react-spinners';
import PropTypes from 'prop-types';

const LoadingSpinner = props => (
  <FadeLoader
    color="grey"
    height={5}
    width={3}
    radius={1}
    loading={props.loading}
    margin="-2px"
  />
);

LoadingSpinner.propTypes = {
  loading: PropTypes.bool.isRequired,
};
export default LoadingSpinner;
