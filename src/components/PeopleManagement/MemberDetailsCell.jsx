import PropTypes from 'prop-types';
import { Stack } from '@openedx/paragon';

const MemberDetailsCell = ({ row }) => (
  <Stack gap={1}>
    <div className="font-weight-bold">
      {row.original?.user?.username}
    </div>
    <div>
      {row.original?.user?.email}
    </div>
  </Stack>
);

MemberDetailsCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      user: PropTypes.shape({
        email: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default MemberDetailsCell;
