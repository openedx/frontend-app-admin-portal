import PropTypes from 'prop-types';

const MemberJoinedDateCell = ({ row }) => (
  <div>
    {row.original.enterpriseCustomerUser.joinedOrg}
  </div>
);

MemberJoinedDateCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      enterpriseCustomerUser: PropTypes.shape({
        joinedOrg: PropTypes.string.isRequired,
      }),
    }).isRequired,
  }).isRequired,
};

export default MemberJoinedDateCell;
