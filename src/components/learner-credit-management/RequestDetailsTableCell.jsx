import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Hyperlink, Stack } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { configuration } from '../../config';
import EmailAddressTableCell from './EmailAddressTableCell';
import EVENT_NAMES from '../../eventTracking';

const RequestDetailsTableCell = ({ row, enterpriseSlug, enterpriseId }) => {
  const { ENTERPRISE_LEARNER_PORTAL_URL } = configuration;
  const handleOnViewCourseClick = () => sendEnterpriseTrackEvent(
    enterpriseId,
    EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_DETAILS_REQUEST_DATATABLE_VIEW_COURSE,
    {
      courseKey: row.original.courseId,
      amount: row.original.amount,
      requestStatus: row.original.requestStatus,
      requestUuid: row.original.uuid,
    },
  );

  return (
    <Stack gap={1}>
      <EmailAddressTableCell
        tableId="approved-requests"
        userEmail={row.original.email}
        contentAssignmentUUID={row.original.uuid}
      />
      <div>
        <Hyperlink
          className="x-small"
          destination={`${ENTERPRISE_LEARNER_PORTAL_URL}/${enterpriseSlug}/course/${row.original.courseId}`}
          onClick={handleOnViewCourseClick}
          target="_blank"
          isInline
        >
          {row.original.courseTitle || 'View Course'}
        </Hyperlink>
      </div>
    </Stack>
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

RequestDetailsTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string,
      email: PropTypes.string,
      courseId: PropTypes.string.isRequired,
      courseTitle: PropTypes.string,
      amount: PropTypes.number,
      requestStatus: PropTypes.string,
    }).isRequired,
  }).isRequired,
  enterpriseSlug: PropTypes.string,
  enterpriseId: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(RequestDetailsTableCell);
