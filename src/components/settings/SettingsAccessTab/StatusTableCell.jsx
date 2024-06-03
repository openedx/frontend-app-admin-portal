import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const StatusTableCell = ({ row }) => {
  const { isValid } = row.original;
  return (
    <Badge variant={isValid ? 'success' : 'light'}>
      {isValid ? (
        <FormattedMessage
          id="settings.access.link_management.status.active"
          defaultMessage="Active"
          description="Status of a link that is active"
        />
      ) : (
        <FormattedMessage
          id="settings.access.link_management.status.inactive"
          defaultMessage="Inactive"
          description="Status of a link that is inactive"
        />
      )}
    </Badge>
  );
};

StatusTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      isValid: PropTypes.bool,
    }),
  }).isRequired,
};

export default StatusTableCell;
