import React, { useMemo } from 'react';
import {
  ActionRow,
  Alert, AlertModal,
  Button, Hyperlink,
  useToggle,
} from '@edx/paragon';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { matchPath, useLocation } from 'react-router-dom';
import { useEnterpriseBudgets } from '../EnterpriseSubsidiesContext/data/hooks';
import { configuration } from '../../config';
import EVENT_NAMES from '../../eventTracking';

import useExpiry from './data/hooks/useExpiry';

const BudgetExpiryAlertAndModal = ({ enterpriseUUID, enterpriseFeatures }) => {
  const [modalIsOpen, modalOpen, modalClose] = useToggle(false);
  const [alertIsOpen, alertOpen, alertClose] = useToggle(false);

  const location = useLocation();

  const budgetDetailRouteMatch = matchPath(
    '/:enterpriseSlug/admin/learner-credit/:budgetId',
    location.pathname,
  );

  const supportUrl = configuration.ENTERPRISE_SUPPORT_URL;

  const { data: budgets } = useEnterpriseBudgets({
    isTopDownAssignmentEnabled: enterpriseFeatures.topDownAssignmentRealTimeLcm,
    enterpriseId: enterpriseUUID,
    enablePortalLearnerCreditManagementScreen: true,
    queryOptions: {
      select: (data) => {
        if (!budgetDetailRouteMatch?.params?.budgetId) {
          return data.budgets;
        }

        return data.budgets.filter(budget => budget.id === budgetDetailRouteMatch.params.budgetId);
      },
    },
  });

  const {
    notification, modal, dismissModal, dismissAlert,
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
              Contact support
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
              <Button variant="tertiary" onClick={dismissModal}>Dismiss</Button>
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
                Contact support
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
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetExpiryAlertAndModal.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool.isRequired,
  }),
};

export default connect(mapStateToProps)(BudgetExpiryAlertAndModal);
