import PropTypes from 'prop-types';
import { formatTimestamp } from '../../utils';

const MemberJoinedDateCell = ({ row }) => (
  <div>
    {formatTimestamp({ timestamp: row.original.created, format: 'MMM DD, YYYY' })}
  </div>
);

MemberJoinedDateCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      created: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default MemberJoinedDateCell;
