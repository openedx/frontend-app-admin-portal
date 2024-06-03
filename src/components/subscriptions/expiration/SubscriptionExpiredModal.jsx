import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ModalDialog, ActionRow } from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { configuration } from '../../../config';
import Img from '../../Img';
import { formatTimestamp } from '../../../utils';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import ContactCustomerSupportButton from '../../ContactCustomerSupportButton';

export const EXPIRED_MODAL_TITLE = 'This subscription cohort is expired';

const SubscriptionExpiredModal = ({
  onClose,
  isOpen,
  onAction,
}) => {
  const { subscription: { expirationDate } } = useContext(SubscriptionDetailContext);

  return (
    <ModalDialog
      title={EXPIRED_MODAL_TITLE}
      onClose={onClose}
      isOpen={isOpen}
      hasCloseButton={false}
    >
      <ModalDialog.Body>
        <Img className="w-25 my-5 mx-auto d-block" src={configuration.LOGO_URL} alt="edX logo" />
        <p>
          <FormattedMessage
            id="adminPortal.subscriptionExpiration.modal.body"
            defaultMessage="Your subscription contract expired on <b>{expirationDate}</b>.
             The edX customer support team is here to help! Get in touch today to renew your subscription and access your subscription management details."
            description="Body text for the subscription expired modal in the admin portal."
            values={{
              expirationDate: formatTimestamp({ timestamp: expirationDate }),
              // eslint-disable-next-line react/no-unstable-nested-components
              b: (chunks) => <b>{chunks}</b>,
            }}
          />
        </p>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage
              id="adminPortal.subscriptionExpiration.modal.dismissButton"
              defaultMessage="Dismiss"
              description="Dismiss button text for the subscription expiring modal in the admin portal."
            />
          </ModalDialog.CloseButton>
          <ContactCustomerSupportButton onClick={onAction} />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

SubscriptionExpiredModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

SubscriptionExpiredModal.defaultProps = {
  isOpen: false,
};

export default SubscriptionExpiredModal;
