import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@edx/paragon';

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

const RequestStatusCell = ({ row }) => {
  const { requestStatus } = row.original;

  const variant = useMemo(
    () => {
      const variantsByStatus = {
        requested: 'primary',
        approved: 'dark',
      };
      return variantsByStatus[requestStatus] || 'light';
    },
    [requestStatus],
  );

  return (
    <Badge variant={variant}>
      {capitalizeFirstLetter(row.original.requestStatus)}
    </Badge>
  );
};

RequestStatusCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      requestStatus: PropTypes.string,
    }),
  }).isRequired,
};

export default RequestStatusCell;
