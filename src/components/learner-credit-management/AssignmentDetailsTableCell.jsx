import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Stack, Hyperlink } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { configuration } from '../../config';
import EmailAddressTableCell from './EmailAddressTableCell';
import EVENT_NAMES from '../../eventTracking';

const AssignmentDetailsTableCell = ({ row, enterpriseSlug, enterpriseId }) => {
  const { ENTERPRISE_LEARNER_PORTAL_URL } = configuration;
  const handleOnViewCourseClick = () => sendEnterpriseTrackEvent(
    enterpriseId,
    EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_DETAILS_ASSIGNED_DATATABLE_VIEW_COURSE,
    {
      courseKey: row.original.contentKey,
      contentQuantityInCents: row.original.contentQuantity,
      errorReason: row.original.errorReason,
      learnerState: row.original.learnerState,
      state: row.original.state,
    },
  );
  return (
    <Stack gap={1}>
      <EmailAddressTableCell
        tableId="assigned"
        userEmail={row.original.learnerEmail}
        contentAssignmentUUID={row.original.uuid}
      />
      <div>
        <Hyperlink
          className="x-small"
          destination={`${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${row.original.contentKey}`}
          onClick={handleOnViewCourseClick}
          target="_blank"
          isInline
        >
          {row.original.contentTitle || 'View Course'}
        </Hyperlink>
      </div>
    </Stack>
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

AssignmentDetailsTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string,
      learnerEmail: PropTypes.string,
      contentKey: PropTypes.string.isRequired,
      contentTitle: PropTypes.string,
      contentQuantity: PropTypes.number,
      errorReason: PropTypes.shape({
        actionType: PropTypes.string,
        errorReason: PropTypes.string,
      }),
      learnerState: PropTypes.string,
      state: PropTypes.string,
    }).isRequired,
  }).isRequired,
  enterpriseSlug: PropTypes.string,
  enterpriseId: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(AssignmentDetailsTableCell);
