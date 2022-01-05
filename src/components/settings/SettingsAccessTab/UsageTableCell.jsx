import PropTypes from 'prop-types';

const UsageTableCell = ({ row }) => {
  const { usageCount, usageLimit } = row.original;
  return `${usageCount.toLocaleString()} of ${usageLimit.toLocaleString()}`;
};

UsageTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      usageCount: PropTypes.number,
      usageLimit: PropTypes.number,
    }),
  }).isRequired,
};

export default UsageTableCell;
