import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Stack, OverlayTrigger, IconButton, Icon, Popover,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

/**
 * Conditionally renders either the email address, when available, or a "Email hidden" message,
 * including a popover that includes additional messaging about why the email is hidden.
 *
 * In the case an email is hidden, includes Segment events for when the popover is opened and closed. Note
 * the row identifier passed as event metadata may be different depending on which table this component is
 * used in and what data source is backing it, i.e.:
 *   - "Spent" table backed by analytics API uses the `enterpriseEnrollmentId`
 *   - "Spent" table backed by transactions API uses the `fulfillmentUUID`.
 *   - "Assigned" table uses the `ContentAssignment` UUID
 *
 * @param {string} tableId Unique identifier for the table this component is used in. Used to namespace
 *  the Segment events.
 * @param {string} userEmail The email address to render, if available.
 * @param {number} [enterpriseEnrollmentId] The enterprise enrollment ID, used by "Spent" table backed by analytics API.
 * @param {string} [fulfillmentIdentifier] The UUID of a `LearnerCreditEnterpriseCourseEnrollment`, used by "Spent"
 *  table backed by transactions API.
 * @param {string} [contentAssignmentUUID] The UUID of a content assignment, used by "Assigned" table.
 * @param {string} enterpriseUUID The UUID of the enterprise, used for Segment events.
 *
 * @returns A React component that renders either an email address or a "Email hidden" message.
 */
const EmailAddressTableCell = ({
  tableId,
  userEmail,
  enterpriseEnrollmentId,
  contentAssignmentUUID,
  fulfillmentIdentifier,
  enterpriseUUID,
}) => {
  if (userEmail) {
    return (
      <span
        className="font-weight-bold"
        data-hj-suppress
      >
        {userEmail}
      </span>
    );
  }
  return (
    <Stack gap={1} direction="horizontal">
      <span className="font-weight-bold">Email hidden</span>
      <OverlayTrigger
        trigger={['click']}
        placement="right"
        overlay={(
          <Popover id="email-hidden-popover">
            <Popover.Title as="h5">Email hidden</Popover.Title>
            <Popover.Content>
              Learner data disabled according to your organization&apos;s or learner&apos;s request.
            </Popover.Content>
          </Popover>
        )}
        onEntered={() => {
          sendEnterpriseTrackEvent(
            enterpriseUUID,
            `edx.ui.enterprise.admin_portal.learner-credit-management.${tableId}.email-hidden-popover.opened`,
            { enterpriseEnrollmentId, fulfillmentIdentifier, contentAssignmentUUID },
          );
        }}
        onExited={() => {
          sendEnterpriseTrackEvent(
            enterpriseUUID,
            `edx.ui.enterprise.admin_portal.learner-credit-management.${tableId}.email-hidden-popover.dismissed`,
            { enterpriseEnrollmentId, fulfillmentIdentifier, contentAssignmentUUID },
          );
        }}
      >
        <IconButton
          src={InfoOutline}
          iconAs={Icon}
          alt="More details"
          variant="secondary"
          size="inline"
        />
      </OverlayTrigger>
    </Stack>
  );
};

EmailAddressTableCell.propTypes = {
  tableId: PropTypes.string.isRequired,
  userEmail: PropTypes.string, // may be undefined/null if email is hidden
  enterpriseEnrollmentId: PropTypes.number,
  contentAssignmentUUID: PropTypes.string,
  fulfillmentIdentifier: PropTypes.string,
  enterpriseUUID: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EmailAddressTableCell);
