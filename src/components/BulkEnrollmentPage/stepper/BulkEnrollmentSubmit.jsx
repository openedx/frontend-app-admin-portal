import React, {
  useContext,
  useState,
} from 'react';
import {
  Button,
  Form,
  AlertModal,
  ActionRow,
  useToggle,
  MailtoLink,
  Stack,
  Toast,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { logError } from '@edx/frontend-platform/logging';
import {
  FINAL_BUTTON_TEST_ID,
  FINAL_BUTTON_TEXT,
  NOTIFY_CHECKBOX_TEST_ID,
  CUSTOMER_SUPPORT_HYPERLINK_TEST_ID,
  ALERT_MODAL_TITLE_TEXT,
  ALERT_MODAL_BODY_TEXT,
  SUPPORT_HYPERLINK_TEXT,
  SUPPORT_EMAIL_SUBJECT,
  SUPPORT_EMAIL_BODY,
} from './constants';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { clearSelectionAction } from '../data/actions';
import { configuration } from '../../../config';

export const BulkEnrollmentAlertModal = ({
  isOpen, toggleClose, enterpriseSlug, error, enterpriseId,
}) => (
  <AlertModal
    title={ALERT_MODAL_TITLE_TEXT}
    isOpen={isOpen}
    onClose={toggleClose}
    footerNode={(
      <ActionRow>
        <Button variant="primary" onClick={toggleClose}>OK</Button>
      </ActionRow>
    )}
  >
    <p>
      {ALERT_MODAL_BODY_TEXT}
      <MailtoLink
        to={configuration.CUSTOMER_SUPPORT_EMAIL}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={CUSTOMER_SUPPORT_HYPERLINK_TEST_ID}
        subject={SUPPORT_EMAIL_SUBJECT + enterpriseSlug}
        body={`enterprise UUID: ${enterpriseId}\n${SUPPORT_EMAIL_BODY}${error}`}
      >
        {SUPPORT_HYPERLINK_TEXT}
      </MailtoLink>
    </p>
  </AlertModal>
);

BulkEnrollmentAlertModal.defaultProps = {
  error: 'Unknown error',
};

BulkEnrollmentAlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleClose: PropTypes.func.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export const generateSuccessMessage = numEmails => {
  if (numEmails > 1) { return `${numEmails} learners have been enrolled.`; }
  if (numEmails === 1) { return `${numEmails} learner has been enrolled.`; }
  return 'No learners have been enrolled.';
};

const BulkEnrollmentSubmit = ({
  enterpriseId, enterpriseSlug, subscription, onEnrollComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(true);
  const [error, setError] = useState('');
  const handleChange = e => setChecked(e.target.checked);

  const {
    emails: [selectedEmails, emailsDispatch],
    courses: [selectedCourses, coursesDispatch],
  } = useContext(BulkEnrollContext);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const courseKeys = selectedCourses.map(
    ({ values }) => values.contentKey,
  );
  const emails = selectedEmails.map(({ values }) => values.userEmail);
  const [isErrorModalOpen, toggleErrorModalOpen, toggleErrorModalClose] = useToggle();
  const hasSelectedCoursesAndEmails = selectedEmails.length > 0 && selectedCourses.length > 0;

  const submitBulkEnrollment = () => {
    setLoading(true);
    const options = {
      emails,
      course_run_keys: courseKeys,
      notify: checked,
    };

    LicenseManagerApiService.licenseBulkEnroll(
      enterpriseId,
      subscription.uuid,
      options,
    ).then(() => {
      setShowToast(true);
      setToastMessage(generateSuccessMessage(selectedEmails.length));
      coursesDispatch(clearSelectionAction());
      emailsDispatch(clearSelectionAction());
      onEnrollComplete();
    }).catch((err) => {
      logError(err);
      setError(err);
      toggleErrorModalOpen();
      setLoading(false);
    });
  };

  return (
    <>
      <BulkEnrollmentAlertModal
        enterpriseSlug={enterpriseSlug}
        toggleClose={toggleErrorModalClose}
        isOpen={isErrorModalOpen}
        error={error}
        enterpriseId={enterpriseId}
      />
      <Stack direction="horizontal" gap={4}>
        <Form.Checkbox
          checked={checked}
          onChange={handleChange}
          data-testid={NOTIFY_CHECKBOX_TEST_ID}
        >
          Notify learners via email
        </Form.Checkbox>
        <Button
          disabled={!hasSelectedCoursesAndEmails && !loading}
          onClick={submitBulkEnrollment}
          data-testid={FINAL_BUTTON_TEST_ID}
        >
          {FINAL_BUTTON_TEXT}
        </Button>
      </Stack>
      {toastMessage && (
        <Toast onClose={() => setShowToast(false)} show={showToast}>{toastMessage}</Toast>
      )}
    </>
  );
};

BulkEnrollmentSubmit.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    enterpriseCatalogUuid: PropTypes.string.isRequired,
  }).isRequired,
  onEnrollComplete: PropTypes.func.isRequired,
};

export default BulkEnrollmentSubmit;
