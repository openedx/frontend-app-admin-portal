import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform/config';

const LinkTableCell = ({ row }) => {
  const { uuid } = row.original;
  return `${getConfig().ENTERPRISE_LEARNER_PORTAL_URL}/invite/${uuid}`;
};

LinkTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      dateCreated: PropTypes.string,
    }),
  }).isRequired,
};

export default LinkTableCell;
