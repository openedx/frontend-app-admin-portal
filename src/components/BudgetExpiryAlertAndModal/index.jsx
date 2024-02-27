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
import { PLAN_EXPIRY_STATUSES } from './data/constants';

const BudgetExpiryAlertAndModal = ({ enterpriseUUID, enterpriseFeatures }) => {
  const [modalIsOpen, modalOpen, modalClose] = useToggle(false);
  const [alertIsOpen, , alertClose] = useToggle(true);

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
    expirationStatus, notification, modal, dismissModal,
  } = useExpiry(
    enterpriseUUID,
    budgets,
    modalOpen,
    modalClose,
  );

  const trackEventMetadata = useMemo(() => {
    if (expirationStatus === PLAN_EXPIRY_STATUSES.active) { return {}; }
    return {
      expirationStatus,
      notification,
    };
  }, [expirationStatus, notification]);

  return (
    <>
      {(expirationStatus === PLAN_EXPIRY_STATUSES.expiring || expirationStatus === PLAN_EXPIRY_STATUSES.expired) && (
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
          onClose={() => alertClose()}
        >
          <Alert.Heading>{notification.title}</Alert.Heading>
          <p>{notification.message}</p>
        </Alert>
      )}

      {(expirationStatus === PLAN_EXPIRY_STATUSES.expiring || expirationStatus === PLAN_EXPIRY_STATUSES.expired) && (
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
          <p>
            {modal.message}
          </p>
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
