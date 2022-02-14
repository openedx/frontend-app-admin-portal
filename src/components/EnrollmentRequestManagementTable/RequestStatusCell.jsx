import PropTypes from 'prop-types';
import { Badge } from '@edx/paragon';

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

const RequestStatusCell = ({ row }) => {
  const variant = row.original.requestStatus === 'requested' ? 'primary' : 'light';
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
