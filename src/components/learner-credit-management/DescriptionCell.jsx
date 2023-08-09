import React from 'react';
import PropTypes from 'prop-types';
import EmailAddressTableCell from './EmailAddressTableCell';

const DescriptionCell = ({ value, row, enterpriseUUID }) => (
  <>
    <div>{value.courseTitle}</div>
    <EmailAddressTableCell row={row} enterpiseUUID={enterpriseUUID} />
  </>
);

DescriptionCell.propTypes = {
  value: PropTypes.shape({
    courseTitle: PropTypes.string.isRequired,
    userEmail: PropTypes.string.isRequired,
  }).isRequired,
  row: PropTypes.shape({
    original: PropTypes.shape({
      userEmail: PropTypes.string,
      enterpriseEnrollmentId: PropTypes.number,
    }),
  }).isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
};
export default DescriptionCell;
