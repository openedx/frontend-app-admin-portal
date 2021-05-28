import React, {
  useContext,
  useState,
} from 'react';
import {
  Button, Form, AlertModal, ActionRow, useToggle, MailtoLink,
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
import { ToastsContext } from '../../Toasts';
import { clearSelectionAction } from '../data/actions';
import { configuration } from '../../../config';

export const BULK_ENROLL_ERROR = 'There was an ';

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
        body={`enterprise UUID: ${enterpriseId}\n${ SUPPORT_EMAIL_BODY }${error}`}
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

export const generateSuccessMessage = numEmails => `${numEmails} learners have been enrolled.`;

const BulkEnrollmentSubmit = ({ enterpriseId, enterpriseSlug, returnToInitialStep }) => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(true);
  const [error, setError] = useState('');
  const handleChange = e => setChecked(e.target.checked);

  const {
    emails: [selectedEmails, emailsDispatch],
    courses: [selectedCourses, coursesDispatch],
  } = useContext(BulkEnrollContext);
  const { addToast } = useContext(ToastsContext);

  const courseKeys = selectedCourses.map(
    ({ original, id }) => original?.advertised_course_run?.key || id,
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

    return LicenseManagerApiService.licenseBulkEnroll(
      enterpriseId,
      options,
    ).then(() => {
      coursesDispatch(clearSelectionAction());
      emailsDispatch(clearSelectionAction());
      addToast(generateSuccessMessage(selectedEmails.length));
      returnToInitialStep();
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
      <Form.Checkbox
        checked={checked}
        onChange={handleChange}
        data-testid={NOTIFY_CHECKBOX_TEST_ID}
      >
        Notify learners via Email
      </Form.Checkbox>
      <Button
        disabled={!hasSelectedCoursesAndEmails && !loading}
        onClick={submitBulkEnrollment}
        data-testid={FINAL_BUTTON_TEST_ID}
      >
        {FINAL_BUTTON_TEXT}
      </Button>
    </>
  );
};

BulkEnrollmentSubmit.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  returnToInitialStep: PropTypes.func.isRequired,
};

export default BulkEnrollmentSubmit;
