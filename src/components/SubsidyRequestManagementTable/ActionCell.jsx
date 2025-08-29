import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
} from '@openedx/paragon';

const ActionCell = ({
  row, onApprove, onDecline, disableApproveButton,
}) => {
  if (row.original.requestStatus !== 'requested') {
    return null;
  }
  return (
    <ActionRow>
      <Button
        variant="tertiary"
        size="inline"
        onClick={() => onDecline(row.original)}
      >
        Decline
      </Button>
      <Button
        variant="link"
        size="inline"
        onClick={() => onApprove(row.original)}
        disabled={disableApproveButton}
      >
        Approve
      </Button>
    </ActionRow>
  );
};

ActionCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      requestStatus: PropTypes.string,
    }),
  }).isRequired,
  onApprove: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  disableApproveButton: PropTypes.bool,
};

ActionCell.defaultProps = {
  disableApproveButton: false,
};

export default ActionCell;
