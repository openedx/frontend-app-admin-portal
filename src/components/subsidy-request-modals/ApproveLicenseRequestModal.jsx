import React, {
  useState, useContext, useMemo, useCallback, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button,
  Form,
  StatefulButton,
  Alert,
  Skeleton,
} from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
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

  const intl = useIntl();

  const [selectedSubscriptionUUID, setSelectedSubscriptionUUID] = useState();
  const [isApprovingRequest, setIsApprovingRequest] = useState(false);
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
  }, [applicableSubscriptions]);

  const approveLicenseRequest = useCallback(async () => {
    setIsApprovingRequest(true);
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
      setIsApprovingRequest(false);
    }
  }, [onSuccess, selectedSubscriptionUUID, enterpriseCustomerUUID, uuid]);

  return (
    <ModalDialog
      className="subsidy-request-modal"
      title={(
        <FormattedMessage
          id="admin.portal.approve.license.request.modal.title"
          defaultMessage="Approve License Request"
          description="Title for the approve license request modal."
        />
)}
      isOpen={isOpen}
      hasCloseButton
      onClose={onClose}
    >
      <Form>
        <ModalDialog.Header>
          <ModalDialog.Title>
            <FormattedMessage
              id="admin.portal.approve.license.request.modal.header"
              defaultMessage="License Assignment"
              description="Header for the license assignment section in the approve license request modal."
            />
          </ModalDialog.Title>
          {hasError && (
            <Alert
              className="mt-3"
              icon={Info}
              variant="danger"
              data-testid="approve-license-request-modal-error-alert"
            >
              <Alert.Heading>
                <FormattedMessage
                  id="admin.portal.approve.license.request.modal.error.heading"
                  defaultMessage="Something went wrong"
                  description="Heading for the error alert in the approve license request modal."
                />
              </Alert.Heading>
              <FormattedMessage
                id="admin.portal.approve.license.request.modal.error.body"
                defaultMessage="Please try again later."
                description="Body text for the error alert in the approve license request modal."
              />
            </Alert>
          )}
        </ModalDialog.Header>
        <ModalDialog.Body>
          {isLoadingApplicableSubscriptions && (
            <div data-testid="approve-license-request-modal-skeleton">
              <Skeleton count={2} />
              <span className="sr-only">
                <FormattedMessage
                  id="admin.portal.approve.license.request.modal.loading"
                  defaultMessage="Loading subscription choices..."
                  description="Loading message for the approve license request modal."
                />
              </span>
            </div>
          )}
          {applicableSubscriptions.length > 1 && (
            <>
              <p>
                <FormattedMessage
                  id="admin.portal.approve.license.request.modal.choose.subscription"
                  defaultMessage="Please choose a subscription from which to allocate a license."
                  description="Message prompting the user to choose a subscription in the approve license request modal."
                />
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
                      description={(
                        <FormattedMessage
                          id="admin.portal.approve.license.request.modal.subscription.description"
                          defaultMessage="Expires on {expirationDate}"
                          description="Description for the subscription in the approve license request modal."
                          values={{ expirationDate: formatTimestamp({ timestamp: subscription.expirationDate }) }}
                        />
                      )}
                    >
                      <strong>
                        {subscription.title}{' '}
                        (<FormattedMessage
                          id="admin.portal.approve.license.request.modal.licenses.remaining"
                          defaultMessage="{unassignedCount} of {totalCount} remaining"
                          description="Remaining licenses information in the approve license request modal."
                          values={{
                            unassignedCount: subscription.licenses.unassigned,
                            totalCount: subscription.licenses.total,
                          }}
                        />)
                      </strong>
                    </Form.Radio>
                  ))}
                </Form.RadioSet>
              </Form.Group>
            </>
          )}
          {applicableSubscriptions.length > 0 && (
            <p>
              <strong>
                <FormattedMessage
                  id="admin.portal.approve.license.request.modal.note"
                  defaultMessage="Please note:"
                  description="Note message in the approve license request modal."
                />
              </strong>{' '}
              <FormattedMessage
                id="admin.portal.approve.license.request.modal.note.description"
                defaultMessage="Learners can apply this subscription to any course, not just the one they requested."
                description="Note description in the approve license request modal."
              />
            </p>
          )}
          {!isLoadingApplicableSubscriptions && applicableSubscriptions.length === 0 && (
            <Alert
              icon={Info}
              variant="danger"
              data-testid="approve-license-request-modal-no-subscriptions-alert"
            >
              <Alert.Heading>
                <FormattedMessage
                  id="admin.portal.approve.license.request.modal.no.subscriptions.heading"
                  defaultMessage="No applicable subscription"
                  description="Heading for the alert when no applicable subscription is found in the approve license request modal."
                />
              </Alert.Heading>
              <FormattedMessage
                id="admin.portal.approve.license.request.modal.no.subscriptions.body"
                defaultMessage="You do not have a subscription that can be allocated for this request."
                description="Body text for the alert when no applicable subscription is found in the approve license request modal."
              />
            </Alert>
          )}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <Button variant="tertiary" onClick={onClose}>
              <FormattedMessage
                id="admin.portal.approve.license.request.modal.button.close"
                defaultMessage="Close"
                description="Close button text in the approve license request modal."
              />
            </Button>
            <StatefulButton
              state={buttonState}
              variant="primary"
              labels={{
                default: intl.formatMessage({
                  id: 'admin.portal.approve.license.request.modal.button.approve.default',
                  defaultMessage: 'Approve',
                  description: 'Approve button text in the approve license request modal.',
                }),
                pending: intl.formatMessage({
                  id: 'admin.portal.approve.license.request.modal.button.approve.pending',
                  defaultMessage: 'Approving...',
                  description: 'Pending state text for the approve button in the approve license request modal.',
                }),
                errored: intl.formatMessage({
                  id: 'admin.portal.approve.license.request.modal.button.approve.errored',
                  defaultMessage: 'Try again',
                  description: 'Errored state text for the approve button in the approve license request modal.',
                }),
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
