import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, IconButton, Icon } from '@openedx/paragon';
import { MoreVert, RemoveCircle, ContentCopy } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const AdminActionsMenu = ({ onRemove, onCopy }) => (
  <Dropdown drop="top">
    <Dropdown.Toggle
      id="admin-kabob-menu"
      data-testid="admin-kabob-menu"
      as={IconButton}
      src={MoreVert}
      iconAs={Icon}
      variant="primary"
      aria-label="Admin actions"
    />

    <Dropdown.Menu>
      <Dropdown.Item onClick={onRemove}>
        <Icon
          src={RemoveCircle}
          className="mr-2 text-danger-500"
        />
        <FormattedMessage
          id="adminPortal.peopleManagement.admins.remove"
          defaultMessage="Remove admin"
          description="Remove admin option in the kabob menu"
        />
      </Dropdown.Item>

      <Dropdown.Item onClick={onCopy}>
        <Icon
          src={ContentCopy}
          className="mr-2"
        />
        <FormattedMessage
          id="adminPortal.peopleManagement.admins.copyInvite"
          defaultMessage="Copy invite link"
          description="Copy invite link in the kabob menu"
        />
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

AdminActionsMenu.propTypes = {
  onRemove: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
};

export default AdminActionsMenu;
