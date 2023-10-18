import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  Icon,
  Tooltip,
  OverlayTrigger,
  DataTableContext,
} from '@edx/paragon';
import {
  Email,
  RemoveCircle,
} from '@edx/paragon/icons';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import LicenseManagementRevokeModal from '../LicenseManagementModals/LicenseManagementRevokeModal';
import LicenseManagementRemindModal from '../LicenseManagementModals/LicenseManagementRemindModal';
import { canRemindLicense, canRevokeLicense } from '../../data/utils';
import {
  useLicenseManagementModalState,
  licenseManagementModalZeroState as modalZeroState,
} from '../LicenseManagementModals/LicenseManagementModalHook';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../eventTracking';

const revokeText = 'Revoke license';
const remindText = 'Remind learner';

const LicenseManagementTableActionColumn = ({
  user,
  subscription,
  onRemindSuccess,
  onRevokeSuccess,
  disabled,
}) => {
  const displayRemind = canRemindLicense(user.status);
  const displayRevoked = canRevokeLicense(user.status);

  const [revokeModal, setRevokeModal] = useLicenseManagementModalState();
  const [remindModal, setRemindModal] = useLicenseManagementModalState();
  const { clearSelection } = useContext(DataTableContext);

  const revokeOnClick = (revokeUser) => {
    setRevokeModal({
      ...revokeModal,
      isOpen: true,
      users: [revokeUser],
    });
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_ROW_CLICK,
    );
  };

  const remindOnClick = (remindUser) => {
    setRemindModal({
      ...remindModal,
      isOpen: true,
      users: [remindUser],
    });
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_ROW_CLICK,
    );
  };

  const handleRevokeSuccess = () => {
    setRevokeModal(modalZeroState);
    clearSelection();
    onRevokeSuccess();
  };

  const handleRemindSuccess = () => {
    setRemindModal(modalZeroState);
    clearSelection();
    onRemindSuccess();
  };

  const handleRevokeSubmit = () => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_ROW_SUBMIT,
    );
  };

  const handleRemindSubmit = () => {
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_ROW_SUBMIT,
    );
  };

  const handleRevokeCancel = () => {
    setRevokeModal(modalZeroState);
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_ROW_CANCEL,
    );
  };

  const handleRemindCancel = () => {
    setRemindModal(modalZeroState);
    sendEnterpriseTrackEvent(
      subscription.enterpriseCustomerUuid,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_ROW_CANCEL,
    );
  };

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
          onClick={() => remindOnClick(user)}
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
          onClick={() => revokeOnClick(user)}
          disabled={disabled}
        />
      </OverlayTrigger>
      )}
      <LicenseManagementRevokeModal
        isOpen={revokeModal.isOpen}
        usersToRevoke={revokeModal.users}
        subscription={subscription}
        onClose={handleRevokeCancel}
        onSuccess={handleRevokeSuccess}
        onSubmit={handleRevokeSubmit}
        revokeAllUsers={false}
        activeFilters={[]}
        totalToRevoke={1}
      />
      <LicenseManagementRemindModal
        isOpen={remindModal.isOpen}
        usersToRemind={remindModal.users}
        subscription={subscription}
        onClose={handleRemindCancel}
        onSuccess={handleRemindSuccess}
        onSubmit={handleRemindSubmit}
        remindAllUsers={false}
        activeFilters={[]}
        totalToRemind={1}
      />
    </>
  );
};

LicenseManagementTableActionColumn.defaultProps = {
  disabled: false,
};

LicenseManagementTableActionColumn.propTypes = {
  subscription: PropTypes.shape({
    enterpriseCustomerUuid: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    expirationDate: PropTypes.string.isRequired,
    isRevocationCapEnabled: PropTypes.bool.isRequired,
    revocations: PropTypes.shape({
      applied: PropTypes.number.isRequired,
      remaining: PropTypes.number.isRequired,
    }),
  }).isRequired,
  user: PropTypes.shape({
    status: PropTypes.string.isRequired,
  }).isRequired,
  onRemindSuccess: PropTypes.func.isRequired,
  onRevokeSuccess: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default LicenseManagementTableActionColumn;
