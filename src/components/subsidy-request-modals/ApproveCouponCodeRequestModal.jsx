import React, {
  useEffect, useState, useMemo, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
  ModalDialog, ActionRow, Button,
  Alert,
  Form,
  Spinner,
  StatefulButton,
} from '@edx/paragon';
import { connect } from 'react-redux';
import moment from 'moment';
import { Info } from '@edx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { fetchCouponOrders } from '../../data/actions/coupons';
import { useApplicableCoupons } from './data/hooks';
import EnterpriseAccessApiService from '../../data/services/EnterpriseAccessApiService';

const ApproveCouponCodeRequestModal = ({
  enterpriseId,
  couponCodeRequest: {
    uuid,
    courseId,
  },
  coupons,
  fetchCouponOrders: getget,
  isOpen,
  onSuccess,
  onClose,
}) => {
  const {
    applicableCoupons,
    isLoading: isLoadingApplicableCoupons,
    error: loadingApplicableCouponsError,
  } = useApplicableCoupons({
    enterpriseId,
    courseRunIds: courseId,
    coupons,
  });
  const [selectedCouponId, setSelectedCouponId] = useState();
  const [isApprovingRequest, setisApprovingRequest] = useState(false);
  const [approveRequestError, setApproveRequestError] = useState(undefined);

  const hasError = loadingApplicableCouponsError || approveRequestError;

  const buttonState = useMemo(() => {
    if (approveRequestError) {
      return 'errored';
    }

    if (isApprovingRequest) {
      return 'loading';
    }

    return 'default';
  }, [isApprovingRequest, approveRequestError]);

  const approveCouponCodeRequest = useCallback(async () => {
    setisApprovingRequest(true);
    try {
      await EnterpriseAccessApiService.approveCouponCodeRequest({
        couponCodeRequestUUIDs: [uuid],
        couponId: selectedCouponId,
      });
      onSuccess();
    } catch (err) {
      logError(err);
      setApproveRequestError(err);
    } finally {
      setisApprovingRequest(false);
    }
  }, [onSuccess, selectedCouponId]);

  useEffect(() => {
    getget();
  }, []);

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
              icon={Info}
              variant="danger"
            >
              <Alert.Heading>Something went wrong</Alert.Heading>
              We weren’t able to process your request. Please try again later.
            </Alert>
          )}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p>
            Please choose a coupon from which to allocate a code.
          </p>
          {isLoadingApplicableCoupons && (
          <div className="d-flex justify-content-center">
            <Spinner
              screenReaderText="Loading coupon choices"
              animation="border"
              variant="primary"
              size="sm"
            />
          </div>
          )}
          {applicableCoupons.length > 0 && (
          <Form.Group>
            <Form.RadioSet
              name="coupon-choices"
              onChange={(e) => setSelectedCouponId(e.target.value)}
            >
              {applicableCoupons.map(coupon => (
                <Form.Radio
                  className="mb-1"
                  value={coupon.id}
                  key={coupon.id}
                  description={`Expires on ${moment(coupon.endDate).format('MM/DD/YYYY')}`}
                >
                  <strong>
                    {coupon.title}{' '}
                  </strong>
                </Form.Radio>
              ))}
            </Form.RadioSet>
          </Form.Group>
          )}
          {!isLoadingApplicableCoupons && applicableCoupons.length === 0
           && (
           <Alert
             icon={Info}
             variant="danger"
           >
             <Alert.Heading>No applicable coupons</Alert.Heading>
             You do not have a coupon that can be allocated for this request.
           </Alert>
           )}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <Button variant="outline-primary" onClick={onClose}>
              Close
            </Button>
            <StatefulButton
              state={buttonState}
              variant="primary"
              labels={{
                default: 'Approve',
                loading: 'Approving...',
                errored: 'Try again',
              }}
              onClick={approveCouponCodeRequest}
              disabled={!applicableCoupons.length > 0 || !selectedCouponId || isLoadingApplicableCoupons || isApprovingRequest}
            />
          </ActionRow>
        </ModalDialog.Footer>
      </Form>
    </ModalDialog>
  );
};

ApproveCouponCodeRequestModal.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  couponCodeRequest: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    courseId: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  coupons: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  fetchCouponOrders: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  fetchCouponOrders: (options) => {
    dispatch(fetchCouponOrders(options));
  },
});

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  coupons: state.coupons.data,
});

export default connect(mapStateToProps, mapDispatchToProps)(ApproveCouponCodeRequestModal);
