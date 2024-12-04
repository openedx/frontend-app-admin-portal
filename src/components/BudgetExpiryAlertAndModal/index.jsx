import React, { useMemo } from 'react';
import {
  ActionRow,
  Alert, AlertModal,
  Button, Hyperlink,
  useToggle,
} from '@openedx/paragon';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { matchPath, useLocation } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useEnterpriseBudgets } from '../EnterpriseSubsidiesContext/data/hooks';
import { configuration } from '../../config';
import EVENT_NAMES from '../../eventTracking';

import useExpiry from './data/hooks/useExpiry';

const BudgetExpiryAlertAndModal = ({ enterpriseUUID, disableExpiryMessagingForLearnerCredit }) => {
  const [modalIsOpen, modalOpen, modalClose] = useToggle(false);
  const [alertIsOpen, alertOpen, alertClose] = useToggle(false);
  const location = useLocation();

  const budgetDetailRouteMatch = matchPath(
    '/:enterpriseSlug/admin/learner-credit/:budgetId/*',
    location.pathname,
  );

  const supportUrl = configuration.ENTERPRISE_SUPPORT_URL;

  const { data: budgets } = useEnterpriseBudgets({
    enterpriseId: enterpriseUUID,
    enablePortalLearnerCreditManagementScreen: true,
    queryOptions: {
      select: (data) => {
        // Filter out retired budgets
        const activeBudgets = data.budgets.filter(budget => !budget.isRetired);

        // If budgetId is not specified in the route, return all active budgets
        if (!budgetDetailRouteMatch?.params?.budgetId) {
          return activeBudgets;
        }

        // Otherwise, return the specific budget that matches the budgetId
        return activeBudgets.filter(budget => budget.id === budgetDetailRouteMatch.params.budgetId);
      },
    },
  });

  const {
    notification, modal, dismissModal, dismissAlert, isNonExpiredBudget,
  } = useExpiry(
    enterpriseUUID,
    budgets,
    modalOpen,
    modalClose,
    alertOpen,
    alertClose,
  );

  const trackEventMetadata = useMemo(() => {
    if (modal === null && notification === null) { return {}; }
    return {
      modal,
      notification,
    };
  }, [modal, notification]);

  if (isNonExpiredBudget && disableExpiryMessagingForLearnerCredit) {
    return null;
  }

  return (
    <>
      {notification && (
        <Alert
          variant={notification.variant}
          show={alertIsOpen}
          actions={[
            <Button
              as={Hyperlink}
              destination={supportUrl}
              onClick={() => sendEnterpriseTrackEvent(
                enterpriseUUID,
                EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_EXPIRY_ALERT_CONTACT_SUPPORT,
                trackEventMetadata,
              )}
              className="flex-shrink-0"
            >
              <FormattedMessage
                id="lcm.budget.detail.page.expiry.alert.contact.support"
                defaultMessage="Contact support"
                description="Expire budget alert Contact support button text"
              />
            </Button>,
          ]}
          dismissible={notification.dismissible}
          onClose={dismissAlert}
          data-testid="expiry-notification-alert"
        >
          <Alert.Heading>{notification.title}</Alert.Heading>
          <p>{notification.message}</p>
        </Alert>
      )}

      {modal && (
        <AlertModal
          title={modal.title}
          size="md"
          isOpen={modalIsOpen}
          onClose={dismissModal}
          footerNode={(
            <ActionRow>
              <Button variant="tertiary" onClick={dismissModal}>
                <FormattedMessage
                  id="lcm.budget.detail.page.expiry.modal.dismiss"
                  defaultMessage="Dismiss"
                  description="Alert modal Dismiss button text"
                />
              </Button>
              <Button
                variant="primary"
                as={Hyperlink}
                destination={supportUrl}
                onClick={() => sendEnterpriseTrackEvent(
                  enterpriseUUID,
                  EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.BUDGET_EXPIRY_MODAL_CONTACT_SUPPORT,
                  trackEventMetadata,
                )}
              >
                <FormattedMessage
                  id="lcm.budget.detail.page.expiry.modal.contact.support"
                  defaultMessage="Contact support"
                  description="Expire budget modal Contact support button text"
                />
              </Button>
            </ActionRow>
          )}
        >
          {modal.message}
        </AlertModal>
      )}
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  disableExpiryMessagingForLearnerCredit: state.portalConfiguration.disableExpiryMessagingForLearnerCredit,
});

BudgetExpiryAlertAndModal.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  disableExpiryMessagingForLearnerCredit: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(BudgetExpiryAlertAndModal);
