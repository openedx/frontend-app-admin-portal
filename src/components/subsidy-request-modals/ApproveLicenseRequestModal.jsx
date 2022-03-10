import React, {
  useState, useContext, useMemo, useCallback, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button,
  Form,
  StatefulButton,
  Alert,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import Skeleton from 'react-loading-skeleton';
import { SubscriptionContext } from '../subscriptions/SubscriptionData';
import { useApplicableSubscriptions } from './data/hooks';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';
import { formatTimestamp } from '../../utils';

export const ApproveLicenseRequestModal = ({
  licenseRequest: {
    uuid,
    courseId,
    enterpriseCustomerUUID,
  },
  isOpen,
  onSuccess,
  onClose,
}) => {
  const { data: subscriptions } = useContext(SubscriptionContext);
  const {
    applicableSubscriptions,
    isLoading: isLoadingApplicableSubscriptions,
    error: loadApplicableSubscriptionsError,
  } = useApplicableSubscriptions({
    enterpriseId: enterpriseCustomerUUID,
    courseRunIds: [courseId],
    subscriptions,
  });

  const [selectedSubscriptionUUID, setSelectedSubscriptionUUID] = useState();
  const [isApprovingRequest, setisApprovingRequest] = useState(false);
  const [approveRequestError, setApproveRequestError] = useState(undefined);

  const hasError = loadApplicableSubscriptionsError || approveRequestError;
  const isApprovalButtonDisabled = !applicableSubscriptions.length > 0
  || !selectedSubscriptionUUID || isLoadingApplicableSubscriptions || isApprovingRequest;

  const buttonState = useMemo(() => {
    if (approveRequestError) {
      return 'errored';
    }

    if (isApprovingRequest) {
      return 'pending';
    }

    return 'default';
  }, [isApprovingRequest, approveRequestError]);

  // If there is only one choice, automatically select it
  useEffect(() => {
    if (applicableSubscriptions.length === 1) {
      setSelectedSubscriptionUUID(applicableSubscriptions[0].uuid);
    }
  }, [applicableSubscriptions.length]);

  const approveLicenseRequest = useCallback(async () => {
    setisApprovingRequest(true);
    try {
      await EnterpriseAccessApiService.approveLicenseRequests({
        enterpriseId: enterpriseCustomerUUID,
        licenseRequestUUIDs: [uuid],
        subscriptionPlanUUID: selectedSubscriptionUUID,
      });
      onSuccess();
    } catch (err) {
      logError(err);
      setApproveRequestError(err);
    } finally {
      setisApprovingRequest(false);
    }
  }, [onSuccess, selectedSubscriptionUUID]);

  return (
    <ModalDialog
      className="subsidy-request-modal"
      title="Approve License Request"
      isOpen={isOpen}
      hasCloseButton
      onClose={onClose}
    >
      <Form>
        <ModalDialog.Header>
          <ModalDialog.Title>
            License Assignment
          </ModalDialog.Title>
          {hasError && (
            <Alert
              className="mt-3"
              icon={Info}
              variant="danger"
              data-testid="approve-license-request-modal-error-alert"
            >
              <Alert.Heading>Something went wrong</Alert.Heading>
              Please try again later.
            </Alert>
          )}
        </ModalDialog.Header>
        <ModalDialog.Body>
          {isLoadingApplicableSubscriptions && (
            <div data-testid="approve-license-request-modal-skeleton">
              <Skeleton count={2} />
              <span className="sr-only">Loading subscription choices...</span>
            </div>
          )}
          {applicableSubscriptions.length > 1 && (
            <>
              <p>
                Please choose a subscription from which to allocate a license.
              </p>
              <Form.Group>
                <Form.RadioSet
                  name="subscription-choices"
                  onChange={(e) => setSelectedSubscriptionUUID(e.target.value)}
                >
                  {applicableSubscriptions.map((subscription, index) => (
                    <Form.Radio
                      data-testid={`approve-license-request-modal-subscription-${index}`}
                      key={subscription.uuid}
                      className="mb-1"
                      value={subscription.uuid}
                      description={`Expires on ${formatTimestamp({ timestamp: subscription.expirationDate })}`}
                    >
                      <strong>
                        {subscription.title}{' '}
                        ({subscription.licenses.unassigned} of {subscription.licenses.total} remaining)
                      </strong>
                    </Form.Radio>
                  ))}
                </Form.RadioSet>
              </Form.Group>
            </>
          )}
          {applicableSubscriptions.length > 0 && (
            <p>
              <strong>Please note:</strong>{' '}
              Learners can apply this subscription to any course, not just the one they requested.
            </p>
          )}
          {!isLoadingApplicableSubscriptions && applicableSubscriptions.length === 0 && (
            <Alert
              icon={Info}
              variant="danger"
              data-testid="approve-license-request-modal-no-subscriptions-alert"
            >
              <Alert.Heading>No applicable subscription</Alert.Heading>
              You do not have a subscription that can be allocated for this request.
            </Alert>
          )}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <Button variant="tertiary" onClick={onClose}>
              Close
            </Button>
            <StatefulButton
              state={buttonState}
              variant="primary"
              labels={{
                default: 'Approve',
                pending: 'Approving...',
                errored: 'Try again',
              }}
              onClick={approveLicenseRequest}
              disabled={isApprovalButtonDisabled}
              data-testid="approve-license-request-modal-approve-btn"
            />
          </ActionRow>
        </ModalDialog.Footer>
      </Form>
    </ModalDialog>
  );
};

ApproveLicenseRequestModal.propTypes = {
  licenseRequest: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    courseId: PropTypes.string.isRequired,
    enterpriseCustomerUUID: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ApproveLicenseRequestModal.defaultProps = {
  onSuccess: undefined,
};

export default ApproveLicenseRequestModal;
