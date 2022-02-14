import PropTypes from 'prop-types';

import { formatTimestamp } from '../../utils';

const RequestDateCell = ({ row }) => formatTimestamp({ timestamp: row.original.requestDate });

RequestDateCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      requestDate: PropTypes.string,
    }),
  }).isRequired,
};

export default RequestDateCell;
