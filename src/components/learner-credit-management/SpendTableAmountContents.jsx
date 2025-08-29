import React from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@openedx/paragon';

import { formatPrice } from './data';

const SpendTableAmountContents = ({ row }) => {
  const formattedContentPrice = formatPrice(row.original.courseListPrice);
  return (
    <Stack gap={2}>
      {row.original.reversal && (
        <div className="text-success font-weight-bold">+{formattedContentPrice}</div>
      )}
      <div>-{formattedContentPrice}</div>
    </Stack>
  );
};

const rowPropType = PropTypes.shape({
  original: PropTypes.shape({
    courseListPrice: PropTypes.number.isRequired,
    reversal: PropTypes.shape({
      created: PropTypes.string,
    }),
  }).isRequired,
}).isRequired;

SpendTableAmountContents.propTypes = {
  row: rowPropType,
};

export default SpendTableAmountContents;
