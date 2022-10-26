import React from 'react';
import PropTypes from 'prop-types';
import {
  Stack, OverlayTrigger, IconButton, Icon, Popover,
} from '@edx/paragon';
import { InfoOutline } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

function EmailAddressTableCell({ row, enterpriseUUID }) {
  if (row.original.userEmail) {
    return <span data-hj-suppress>{row.original.userEmail}</span>;
  }
  return (
    <Stack gap={2} direction="horizontal">
      <span>Email hidden</span>
      <OverlayTrigger
        trigger={['hover', 'click']}
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
            'edx.ui.enterprise.admin_portal.learner-credit-management.table.email-hidden-popover.opened',
            {
              enterpriseEnrollmentId: row.original.enterpriseEnrollmentId,
            },
          );
        }}
        onExited={() => {
          sendEnterpriseTrackEvent(
            enterpriseUUID,
            'edx.ui.enterprise.admin_portal.learner-credit-management.table.email-hidden-popover.dismissed',
            {
              enterpriseEnrollmentId: row.original.enterpriseEnrollmentId,
            },
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
}

EmailAddressTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      userEmail: PropTypes.string,
      enterpriseEnrollmentId: PropTypes.number,
    }),
  }).isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
};

export default EmailAddressTableCell;
