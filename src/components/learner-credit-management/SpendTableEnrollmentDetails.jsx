import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Stack, Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import EmailAddressTableCell from './EmailAddressTableCell';
import { formatDate } from './data';
import EVENT_NAMES from '../../eventTracking';

const SpendTableEnrollmentDetailsContents = ({
  row,
  enableLearnerPortal,
  enterpriseSlug,
  enterpriseId,
}) => (
  <Stack gap={1}>
    {row.original.reversal && (
      <div className="text-success font-weight-bold text-uppercase x-small">
        Refunded on {formatDate(row.original.reversal.created)}
      </div>
    )}
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
          onClick={() => {
            sendEnterpriseTrackEvent(
              enterpriseId,
              EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_DETAILS_SPENT_DATATABLE_VIEW_COURSE,
              {
                courseKey: row.original.courseKey,
                courseListPriceInCents: row.original.courseListPrice * 100,
              },
            );
          }}
          target="_blank"
          isInline
        >
          {row.original.courseTitle || 'View course'}
        </Hyperlink>
      ) : (
        <span className="x-small text-light-900">{row.original.courseTitle}</span>
      )}
    </div>
  </Stack>
);

const rowPropType = PropTypes.shape({
  original: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    courseKey: PropTypes.string.isRequired,
    courseTitle: PropTypes.string,
    courseListPrice: PropTypes.number,
    userEmail: PropTypes.string,
    enterpriseEnrollmentId: PropTypes.number,
    fulfillmentIdentifier: PropTypes.string,
    reversal: PropTypes.shape({
      created: PropTypes.string,
    }),
  }).isRequired,
}).isRequired;

const mapStateToProps = state => ({
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

const ConnectedSpendTableEnrollmentDetailsContents = connect(mapStateToProps)(SpendTableEnrollmentDetailsContents);

SpendTableEnrollmentDetailsContents.propTypes = {
  row: rowPropType,
  enableLearnerPortal: PropTypes.bool.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const SpendTableEnrollmentDetails = ({ row }) => <ConnectedSpendTableEnrollmentDetailsContents row={row} />;

SpendTableEnrollmentDetails.propTypes = {
  row: rowPropType,
};

export default SpendTableEnrollmentDetails;
