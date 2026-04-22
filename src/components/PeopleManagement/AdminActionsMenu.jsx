import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, IconButton, Icon } from '@openedx/paragon';
import { MoreVert, RemoveCircle, ContentCopy } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const AdminActionsMenu = ({ adminId, onRemove, onCopy }) => {
  const menuId = `admin-kabob-menu-${adminId}`;
  return (
    <Dropdown drop="top">
      <Dropdown.Toggle
        id={menuId}
        data-testid="admin-kabob-menu"
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        aria-label="Admin actions"
      />

      <Dropdown.Menu style={{ minWidth: 'auto' }}>
        <Dropdown.Item onClick={onRemove} className="py-2 px-3">
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

        <Dropdown.Item onClick={onCopy} className="py-2 px-3">
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
};

AdminActionsMenu.propTypes = {
  adminId: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
};

export default AdminActionsMenu;
