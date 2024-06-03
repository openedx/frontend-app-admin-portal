import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  AlertModal,
  Alert,
  Button,
  StatefulButton,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

const DisableLinkManagementAlertModal = ({
  isOpen,
  onClose,
  onDisable,
  isLoading,
  error,
}) => {
  const intl = useIntl();
  const modalDisableButtonState = isLoading ? 'pending' : 'default';

  const disableButtonProps = {
    labels: {
      default: intl.formatMessage({
        id: 'adminPortal.settings.access.disableLinkButton',
        defaultMessage: 'Disable',
        description: 'Label for the disable link button.',
      }),
      pending: intl.formatMessage({
        id: 'adminPortal.settings.access.disableLinkButton.pending',
        defaultMessage: 'Disabling...',
        description: 'Label for the disable link button in pending state.',
      }),
    },
    state: modalDisableButtonState,
    variant: 'primary',
    onClick: onDisable,
  };

  return (
    <AlertModal
      title={intl.formatMessage({
        id: 'adminPortal.settings.access.disableLinkModal.title',
        defaultMessage: 'Are you sure?',
        description: 'Title for the disable link modal.',
      })}
      isOpen={isOpen}
      onClose={onClose}
      footerNode={(
        <ActionRow>
          <Button disabled={isLoading} variant="tertiary" onClick={onClose}>
            <FormattedMessage
              id="adminPortal.settings.access.disableLinkModal.goBack"
              defaultMessage="Go back"
              description="Button text to go back to the previous page."
            />
          </Button>
          <StatefulButton disabled={isLoading} {...disableButtonProps}>
            <FormattedMessage
              id="adminPortal.settings.access.disableLinkButton"
              defaultMessage="Disable"
              description="Label for the disable link button."
            />
          </StatefulButton>
        </ActionRow>
      )}
    >
      {error && (
        <Alert icon={Info} variant="danger" dismissible>
          <Alert.Heading>
            <FormattedMessage
              id="adminPortal.settings.access.disableLinkModal.error"
              defaultMessage="Something went wrong"
              description="Error message for the disable link modal."
            />
          </Alert.Heading>
          <FormattedMessage
            id="adminPortal.settings.access.disableLinkModal.errorDescription"
            defaultMessage="There was an issue with your request, please try again."
            description="Error description for the disable link modal."
          />
        </Alert>
      )}
      <p>
        <FormattedMessage
          id="adminPortal.settings.access.disableLinkModal.description"
          defaultMessage="If you disable access via link, all links will be deactivated and your learners will no longer have access. Links cannot be reactivated."
          description="Description for the disable link modal."
        />
      </p>
    </AlertModal>
  );
};

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
