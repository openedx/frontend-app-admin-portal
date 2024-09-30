import PropTypes from 'prop-types';

import getInviteURL from './utils';

const LinkTableCell = ({ row, enterpriseSlug }) => {
  const { uuid } = row.original;
  return getInviteURL(enterpriseSlug, uuid);
};

LinkTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string,
    }),
  }).isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export default LinkTableCell;
