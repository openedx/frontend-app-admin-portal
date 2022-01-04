import { useMemo } from 'react';
import PropTypes from 'prop-types';

import { formatTimestamp } from '../../../utils';

const DateCreatedTableCell = ({ row }) => {
  const { created } = row.original;
  const formattedDateCreated = useMemo(() => formatTimestamp({ timestamp: created }), [created]);
  return formattedDateCreated;
};

DateCreatedTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      created: PropTypes.string,
    }),
  }).isRequired,
};

export default DateCreatedTableCell;
