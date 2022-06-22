import React from 'react';
import PropTypes from 'prop-types';

const OfferNameHeading = ({ name }) => (
  <h2 className="mb-3">
    {name}
  </h2>
);

OfferNameHeading.propTypes = {
  name: PropTypes.string,
};

OfferNameHeading.defaultProps = {
  name: 'Overview',
};

export default OfferNameHeading;
