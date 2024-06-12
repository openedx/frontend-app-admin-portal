import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ActionRow, ModalDialog } from '@openedx/paragon';

import { useIntl } from '@edx/frontend-platform/i18n';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { getSubscriptionExpiringCookieName } from '../data/utils';
import ContactCustomerSupportButton from '../../ContactCustomerSupportButton';
import { formatTimestamp } from '../../../utils';

export const EXPIRING_MODAL_TITLE = 'Renew your expiring subscription';

const SubscriptionExpiringModal = ({
  onClose,
  isOpen,
  expirationThreshold,
  enterpriseId,
  onAction,
}) => {
  const { subscription: { agreementNetDaysUntilExpiration, expirationDate } } = useContext(SubscriptionDetailContext);
  const intl = useIntl();

  const handleClose = () => {
    if (expirationThreshold) {
      const seenCurrentExpirationModalCookieName = getSubscriptionExpiringCookieName({
        expirationThreshold,
        enterpriseId,
      });
      // Mark that the user has seen this range's expiration modal when they close it
      global.localStorage.setItem(seenCurrentExpirationModalCookieName, true);
    }
    onClose();
  };

  return (
    <ModalDialog
      title={intl.formatMessage({
        id: 'admin.portal.subscription.expiration.modal.title',
        defaultMessage: 'Renew your expiring subscription',
        description: 'Title for the subscription expiring modal in the admin portal.',
      })}
      onClose={handleClose}
      isOpen={isOpen}
      hasCloseButton={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage({
            id: 'admin.portal.subscription.expiration.modal.header',
            defaultMessage: 'Your subscription contract expires in {expirationDays} days',
            description: 'Header for the subscription expiring modal in the admin portal.',
          }, { expirationDays: agreementNetDaysUntilExpiration })}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <p>
          {
            intl.formatMessage({
              id: 'admin.portal.subscription.expiration.modal.body.p1',
              defaultMessage: `It's time to renew your subscription contract with edX!
            The edX customer support team is here to help.
            Get in touch today to minimize access disruptions for your learners.`,
              description: 'Body paragraph 1 for the subscription expiring modal in the admin portal.',
            })
          }
        </p>
        <i>
          {intl.formatMessage({
            id: 'admin.portal.subscription.expiration.modal.body.accessExpires',
            defaultMessage: 'Access expires on {date}',
            description: 'Message indicating when access expires in the subscription expiring modal in the admin portal.',
          }, { date: formatTimestamp({ timestamp: expirationDate }) })}
        </i>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage({
              id: 'admin.portal.subscription.expiration.modal.footer.dismiss.label',
              defaultMessage: 'Dismiss',
              description: 'Label for the dismiss button in the footer of the subscription expiring modal in the admin portal.',
            })}
          </ModalDialog.CloseButton>
          <ContactCustomerSupportButton onClick={onAction} />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

SubscriptionExpiringModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  expirationThreshold: PropTypes.number,
};

SubscriptionExpiringModal.defaultProps = {
  isOpen: false,
  expirationThreshold: null,
};

export default SubscriptionExpiringModal;
