import PropTypes from 'prop-types';
import { Stack } from '@openedx/paragon';

const MemberDetailsCell = ({ row }) => (
  <Stack gap={1}>
    <div className="font-weight-bold">
      {row.original?.enterpriseCustomerUser?.name}
    </div>
    <div>
      {row.original?.enterpriseCustomerUser?.email}
    </div>
  </Stack>
);

MemberDetailsCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      enterpriseCustomerUser: PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default MemberDetailsCell;
