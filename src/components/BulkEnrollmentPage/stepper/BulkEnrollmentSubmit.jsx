import React, {
  useContext,
  useState,
} from 'react';
import {
  Button, Form, AlertModal, Hyperlink, ActionRow, useToggle,
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
} from './constants';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { ToastsContext } from '../../Toasts';
import { clearSelectionAction } from '../data/actions';

export const BulkEnrollmentAlertModal = ({ isOpen, toggleClose, enterpriseSlug }) => (
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
      <Hyperlink
        destination={`/${enterpriseSlug}/admin/support`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={CUSTOMER_SUPPORT_HYPERLINK_TEST_ID}
      >
        {SUPPORT_HYPERLINK_TEXT}
      </Hyperlink>
    </p>
  </AlertModal>
);

BulkEnrollmentAlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleClose: PropTypes.func.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

export const generateSuccessMessage = numEmails => `${numEmails} learners have been enrolled.`;

const BulkEnrollmentSubmit = ({ enterpriseId, enterpriseSlug, returnToInitialStep }) => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(true);
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
      />
      <Form.Checkbox
        checked={checked}
        onChange={handleChange}
        data-testid={NOTIFY_CHECKBOX_TEST_ID}
      >
        Notify learners
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
