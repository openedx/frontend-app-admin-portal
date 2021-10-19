import React from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  Icon,
  Tooltip,
  OverlayTrigger,
} from '@edx/paragon';
import {
  Email,
  RemoveCircle,
} from '@edx/paragon/icons';

import { canRemindLicense, canRevokeLicense } from '../../data/utils';

const revokeText = 'Revoke license';
const remindText = 'Remind learner';

const LicenseManagementTableActionColumn = ({
  user,
  rowRemindOnClick,
  rowRevokeOnClick,
  disabled,
}) => {
  const displayRemind = canRemindLicense(user.status);
  const displayRevoked = canRevokeLicense(user.status);

  return (
    <>
      {displayRemind
      && (
      <OverlayTrigger
        placement="top"
        overlay={(
          <Tooltip id="tooltip-remind">
            {remindText}
          </Tooltip>
        )}
      >
        <IconButton
          alt={remindText}
          title={remindText}
          src={Email}
          iconAs={Icon}
          variant="secondary"
          onClick={() => rowRemindOnClick(user)}
          disabled={disabled}
        />
      </OverlayTrigger>
      )}
      {displayRevoked
      && (
      <OverlayTrigger
        placement="top"
        overlay={(
          <Tooltip id="tooltip-revoke">
            {revokeText}
          </Tooltip>
        )}
      >
        <IconButton
          alt={revokeText}
          title={revokeText}
          src={RemoveCircle}
          style={{ marginLeft: displayRemind ? 0 : 44 }}
          iconAs={Icon}
          variant="danger"
          onClick={() => rowRevokeOnClick(user)}
          disabled={disabled}
        />
      </OverlayTrigger>
      )}

    </>
  );
};

LicenseManagementTableActionColumn.defaultProps = {
  disabled: false,
};

LicenseManagementTableActionColumn.propTypes = {
  user: PropTypes.shape({
    status: PropTypes.string.isRequired,
  }).isRequired,
  rowRemindOnClick: PropTypes.func.isRequired,
  rowRevokeOnClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default LicenseManagementTableActionColumn;
