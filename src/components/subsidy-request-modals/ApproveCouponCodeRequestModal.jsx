import React, {
  useState, useMemo, useCallback, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button,
  Alert,
  Form,
  StatefulButton,
  Skeleton,
} from '@edx/paragon';
import { connect } from 'react-redux';
import { Info } from '@edx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { useApplicableCoupons } from './data/hooks';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';
import { formatTimestamp } from '../../utils';

export const ApproveCouponCodeRequestModal = ({
  couponCodeRequest: {
    uuid,
    courseId,
    enterpriseCustomerUUID,
  },
  coupons,
  isOpen,
  onSuccess,
  onClose,
}) => {
  const {
    applicableCoupons,
    isLoading: isLoadingApplicableCoupons,
    error: loadApplicableCouponsError,
  } = useApplicableCoupons({
    enterpriseId: enterpriseCustomerUUID,
    courseRunIds: [courseId],
    coupons,
  });
  const [selectedCouponId, setSelectedCouponId] = useState();
  const [isApprovingRequest, setIsApprovingRequest] = useState(false);
  const [approveRequestError, setApproveRequestError] = useState(undefined);

  const hasError = loadApplicableCouponsError || approveRequestError;
  const isApprovalButtonDisabled = !applicableCoupons.length > 0
  || !selectedCouponId || isLoadingApplicableCoupons || isApprovingRequest;

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
    if (applicableCoupons.length === 1) {
      setSelectedCouponId(applicableCoupons[0].id);
    }
  }, [applicableCoupons]);

  const approveCouponCodeRequest = useCallback(async () => {
    setIsApprovingRequest(true);
    try {
      await EnterpriseAccessApiService.approveCouponCodeRequests({
        enterpriseId: enterpriseCustomerUUID,
        couponCodeRequestUUIDs: [uuid],
        couponId: selectedCouponId,
      });
      onSuccess();
    } catch (err) {
      logError(err);
      setApproveRequestError(err);
    } finally {
      setIsApprovingRequest(false);
    }
  }, [onSuccess, selectedCouponId, enterpriseCustomerUUID, uuid]);

  return (
    <ModalDialog
      className="subsidy-request-modal"
      title="Approve Coupon Code Request"
      isOpen={isOpen}
      hasCloseButton
      onClose={onClose}
    >
      <Form>
        <ModalDialog.Header>
          <ModalDialog.Title>
            Code Assignment
          </ModalDialog.Title>
          {hasError && (
            <Alert
              className="mt-3"
              icon={Info}
              variant="danger"
              data-testid="approve-coupon-code-request-modal-error-alert"
            >
              <Alert.Heading>Something went wrong</Alert.Heading>
              Please try again later.
            </Alert>
          )}
        </ModalDialog.Header>
        <ModalDialog.Body>
          {isLoadingApplicableCoupons && (
            <div data-testid="approve-coupon-code-request-modal-skeleton">
              <Skeleton count={2} />
              <span className="sr-only">Loading coupon choices...</span>
            </div>
          )}
          {applicableCoupons.length > 1 && (
            <>
              <p>
                Please choose a coupon from which to allocate a code.
              </p>
              <Form.Group>
                <Form.RadioSet
                  name="coupon-choices"
                  onChange={(e) => setSelectedCouponId(e.target.value)}
                >
                  {applicableCoupons.map((coupon, index) => (
                    <Form.Radio
                      className="mb-1"
                      value={coupon.id}
                      data-testid={`approve-coupon-code-request-modal-coupon-${index}`}
                      key={coupon.id}
                      description={`Expires on ${formatTimestamp({ timestamp: coupon.endDate })}`}
                    >
                      <strong>
                        {coupon.title}{' '}
                        ({coupon.numUnassigned} of {coupon.maxUses} remaining)
                      </strong>
                    </Form.Radio>
                  ))}
                </Form.RadioSet>
              </Form.Group>
            </>
          )}
          {applicableCoupons.length > 0 && (
          <p>
            <strong>Please note:</strong>{' '}
            Learners can apply this code to any course, not just the one they requested.
          </p>
          )}
          {!isLoadingApplicableCoupons && applicableCoupons.length === 0 && (
            <Alert
              icon={Info}
              variant="danger"
              data-testid="approve-coupon-code-request-modal-no-coupons-alert"
            >
              <Alert.Heading>No applicable coupons</Alert.Heading>
              You do not have a coupon that can be allocated for this request.
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
              onClick={approveCouponCodeRequest}
              disabled={isApprovalButtonDisabled}
              data-testid="approve-coupon-code-request-modal-approve-btn"
            />
          </ActionRow>
        </ModalDialog.Footer>
      </Form>
    </ModalDialog>
  );
};

ApproveCouponCodeRequestModal.propTypes = {
  couponCodeRequest: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    courseId: PropTypes.string.isRequired,
    enterpriseCustomerUUID: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  coupons: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      endDate: PropTypes.string,
      title: PropTypes.string,
      numUnassigned: PropTypes.number,
      maxUses: PropTypes.number,
    })),
  }).isRequired,
};

const mapStateToProps = state => ({
  coupons: state.coupons.data ? camelCaseObject(state.coupons.data) : { results: [] },
});

export default connect(mapStateToProps)(ApproveCouponCodeRequestModal);
