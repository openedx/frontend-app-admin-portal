import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Hyperlink } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';

import EmailAddressTableCell from './EmailAddressTableCell';

const SpendTableEnrollmentDetailsContents = ({
  row,
  enableLearnerPortal,
  enterpriseSlug,
}) => (
  <>
    <EmailAddressTableCell
      tableId="spent"
      userEmail={row.original.userEmail}
      enterpriseEnrollmentId={row.original.enterpriseEnrollmentId}
      fulfillmentIdentifier={row.original.fulfillmentIdentifier}
    />
    <div>
      {enableLearnerPortal ? (
        <Hyperlink
          className="x-small"
          destination={`${getConfig().ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${row.original.courseKey}`}
          target="_blank"
          isInline
        >
          {row.original.courseTitle}
        </Hyperlink>
      ) : (
        <span className="x-small text-light-900">{row.original.courseTitle}</span>
      )}
    </div>
  </>
);

const rowPropType = PropTypes.shape({
  original: PropTypes.shape({
    courseKey: PropTypes.string.isRequired,
    courseTitle: PropTypes.string.isRequired,
    userEmail: PropTypes.string.isRequired,
    enterpriseEnrollmentId: PropTypes.number,
    fulfillmentIdentifier: PropTypes.string,
  }).isRequired,
}).isRequired;

const mapStateToProps = state => ({
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

const ConnectedSpendTableEnrollmentDetailsContents = connect(mapStateToProps)(SpendTableEnrollmentDetailsContents);

SpendTableEnrollmentDetailsContents.propTypes = {
  row: rowPropType,
  enableLearnerPortal: PropTypes.bool.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

const SpendTableEnrollmentDetails = ({ row }) => <ConnectedSpendTableEnrollmentDetailsContents row={row} />;

SpendTableEnrollmentDetails.propTypes = {
  row: rowPropType,
};

export default SpendTableEnrollmentDetails;
