import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ModalDialog, ActionRow } from '@edx/paragon';

import { configuration } from '../../../config';
import Img from '../../Img';
import { formatTimestamp } from '../../../utils';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import ContactCustomerSupportButton from '../../common/ContactCustomerSupportButton';

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
          Your subscription contract expired on <b>{formatTimestamp({ timestamp: expirationDate })}</b>.
          The edX customer support team is here to help! Get in touch today to renew your subscription
          and access your subscription management details.
        </p>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            Dismiss
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
