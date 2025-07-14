import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Icon, IconButton } from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import ApprovedRequestTableCancel from './ApprovedRequestTableCancel';

const ApprovedRequestActionsTableCell = ({ row }) => {
  const { original } = row;

  // Check if the cancel button should be shown for this row
  const shouldShowCancelButton = (
    (original.lastActionStatus === 'waiting_for_learner' || original.requestStatus === 'approved')
  );

  // Don't render dropdown if no actions are available
  if (!shouldShowCancelButton) {
    return null;
  }

  return (
    <Dropdown drop="top">
      <Dropdown.Toggle
        id={`dropdown-toggle-${original.uuid}`}
        data-testid={`dropdown-toggle-${original.uuid}`}
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        aria-label="More actions"
      />
      <Dropdown.Menu>
        <ApprovedRequestTableCancel row={row} />
      </Dropdown.Menu>
    </Dropdown>
  );
};

ApprovedRequestActionsTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      learnerEmail: PropTypes.string,
      lastActionStatus: PropTypes.string,
      requestStatus: PropTypes.string,
      courseTitle: PropTypes.string,
      courseListPrice: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default ApprovedRequestActionsTableCell;
