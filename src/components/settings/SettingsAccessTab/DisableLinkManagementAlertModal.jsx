import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  AlertModal,
  Alert,
  Button,
  StatefulButton,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

const DisableLinkManagementAlertModal = ({
  isOpen,
  onClose,
  onDisable,
  isLoadingDisable,
  error,
}) => {
  const modalDisableButtonState = isLoadingDisable ? 'pending' : 'default';

  const disableButtonProps = {
    labels: {
      default: 'Disable',
      pending: 'Disabling...',
    },
    state: modalDisableButtonState,
    variant: 'primary',
    onClick: onDisable,
  };

  return (
    <AlertModal
      title="Are you sure?"
      isOpen={isOpen}
      onClose={onClose}
      footerNode={(
        <ActionRow>
          <Button disabled={isLoadingDisable} variant="tertiary" onClick={onClose}>Go back</Button>
          <StatefulButton {...disableButtonProps}>Disable</StatefulButton>
        </ActionRow>
      )}
    >
      {error && (
        <Alert icon={Info} variant="danger" dismissible>
          <Alert.Heading>Something went wrong</Alert.Heading>
          There was an issue with your request, try again.
        </Alert>
      )}
      <p>
        If you disable access via link, all links will be deactivated and your
        learners will no longer have access. Links cannot be reactivated.
      </p>
    </AlertModal>
  );
};

DisableLinkManagementAlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDisable: PropTypes.func.isRequired,
  isLoadingDisable: PropTypes.bool,
  error: PropTypes.bool,
};

DisableLinkManagementAlertModal.defaultProps = {
  isLoadingDisable: false,
  error: false,
};

export default DisableLinkManagementAlertModal;
