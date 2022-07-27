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

function DisableLinkManagementAlertModal({
  isOpen,
  onClose,
  onDisable,
  isLoading,
  error,
}) {
  const modalDisableButtonState = isLoading ? 'pending' : 'default';

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
          <Button disabled={isLoading} variant="tertiary" onClick={onClose}>Go back</Button>
          <StatefulButton disabled={isLoading} {...disableButtonProps}>Disable</StatefulButton>
        </ActionRow>
      )}
    >
      {error && (
        <Alert icon={Info} variant="danger" dismissible>
          <Alert.Heading>Something went wrong</Alert.Heading>
          There was an issue with your request, please try again.
        </Alert>
      )}
      <p>
        If you disable access via link, all links will be deactivated and your
        learners will no longer have access. Links cannot be reactivated.
      </p>
    </AlertModal>
  );
}

DisableLinkManagementAlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDisable: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.bool,
};

DisableLinkManagementAlertModal.defaultProps = {
  isLoading: false,
  error: false,
};

export default DisableLinkManagementAlertModal;
