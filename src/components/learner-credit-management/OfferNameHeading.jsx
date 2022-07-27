import React from 'react';
import PropTypes from 'prop-types';

function OfferNameHeading({ name }) {
  return (
    <h2 className="mb-3">
      {name}
    </h2>
  );
}

OfferNameHeading.propTypes = {
  name: PropTypes.string,
};

OfferNameHeading.defaultProps = {
  name: 'Overview',
};

export default OfferNameHeading;
