import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logError } from '@edx/frontend-platform/logging';
import BulkEnrollmentSubmit, {
  BulkEnrollmentAlertModal,
  generateSuccessMessage,
} from './BulkEnrollmentSubmit';
import {
  NOTIFY_CHECKBOX_TEST_ID,
  FINAL_BUTTON_TEST_ID,
  CUSTOMER_SUPPORT_HYPERLINK_TEST_ID,
  ALERT_MODAL_TITLE_TEXT,
  SUPPORT_EMAIL_SUBJECT,
  SUPPORT_EMAIL_BODY,
} from './constants';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { clearSelectionAction } from '../data/actions';
import { ToastsContext } from '../../Toasts/ToastsProvider';
import { renderWithRouter } from '../../test/testUtils';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import { configuration } from '../../../config';

jest.mock('../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true, // this property makes it work
  default: {
    licenseBulkEnroll: jest.fn(),
  },
}));

const errorText = 'a 500 error occurred';
const testSlug = 'test-enterprise';
const testEntId = 'abc1234z-53c9-4071-b698-b8d436eb0295';
const defaultProps = {
  enterpriseId: testEntId,
  enterpriseSlug: testSlug,
  returnToInitialStep: jest.fn(),
};
const defaultAlertProps = {
  isOpen: true,
  toggleClose: jest.fn(),
  enterpriseId: testEntId,
  error: errorText,
  enterpriseSlug: testSlug,
};

const emailsDispatch = jest.fn();
const coursesDispatch = jest.fn();

const defaultBulkEnrollInfo = {
  emails: [[], emailsDispatch],
  courses: [[], coursesDispatch],
};

const userEmails = ['ayy', 'lmao'];
const courseNames = ['Alex', 'Lael'];

const selectedEmails = userEmails.map(
  (email, index) => ({ id: index, values: { userEmail: email } }),
);
const selectedCourses = courseNames.map(
  (course) => ({ id: course }),
);
const bulkEnrollWithAllSelectedRows = {
  emails: [selectedEmails, emailsDispatch],
  courses: [selectedCourses, coursesDispatch],
};
const bulkEnrollWithEmailsSelectedRows = {
  emails: [selectedEmails, emailsDispatch],
  courses: [[], coursesDispatch],
};
const bulkEnrollWithCoursesSelectedRows = {
  emails: [[], emailsDispatch],
  courses: [selectedCourses, coursesDispatch],
};
const addToast = jest.fn();

// eslint-disable-next-line react/prop-types
const BulkEnrollmentSubmitWrapper = ({ bulkEnrollInfo = defaultBulkEnrollInfo, ...props }) => (
  <ToastsContext.Provider value={{ addToast }}>
    <BulkEnrollContext.Provider value={bulkEnrollInfo}>
      <BulkEnrollmentSubmit {...props} />
    </BulkEnrollContext.Provider>
  </ToastsContext.Provider>
);

describe('BulkEnrollmentAlertModal', () => {
  beforeEach(() => {
    defaultAlertProps.toggleClose.mockClear();
  });

  it('renders an alert', () => {
    render(<BulkEnrollmentAlertModal {...defaultAlertProps} />);
    expect(screen.getByText(ALERT_MODAL_TITLE_TEXT)).toBeInTheDocument();
  });

  it('links to support', async () => {
    renderWithRouter(
      <BulkEnrollmentAlertModal {...defaultAlertProps} />,
      {
        route: '/',
        path: '/',
      },
    );
    /* click link */
    const supportLink = screen.getByTestId(CUSTOMER_SUPPORT_HYPERLINK_TEST_ID);
    expect(decodeURIComponent(supportLink.href)).toEqual(
      `mailto:${configuration.CUSTOMER_SUPPORT_EMAIL}?body=enterprise UUID: ${testEntId}\n${SUPPORT_EMAIL_BODY}${errorText}&subject=${SUPPORT_EMAIL_SUBJECT + testSlug}`,
    );
  });

  it('calls toggleClose when the close button is clicked', () => {
    render(<BulkEnrollmentAlertModal {...defaultAlertProps} />);
    const closeButton = screen.getByText('OK');
    userEvent.click(closeButton);
    expect(defaultAlertProps.toggleClose).toBeCalledTimes(1);
  });
});

describe('BulkEnrollmentSubmit', () => {
  const flushPromises = () => new Promise(setImmediate);
  beforeEach(() => {
    emailsDispatch.mockClear();
    coursesDispatch.mockClear();
    addToast.mockClear();
    logError.mockClear();
    defaultProps.returnToInitialStep.mockClear();
  });

  it('displays checkbox and button', () => {
    render(<BulkEnrollmentSubmitWrapper {...defaultProps} />);
    expect(screen.getByTestId(FINAL_BUTTON_TEST_ID)).toBeInTheDocument();
    expect(screen.getByTestId(NOTIFY_CHECKBOX_TEST_ID)).toBeInTheDocument();
  });

  it('tests button does not work when no courses and emails selected', () => {
    render(<BulkEnrollmentSubmitWrapper {...defaultProps} />);
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    expect(button).toBeDisabled();
  });

  it('tests button is not disabled when courses and emails are selected', () => {
    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    expect(button).not.toBeDisabled();
  });

  it('tests button is disabled when courses are not selected but emails are', () => {
    const mockPromiseResolve = Promise.resolve({ data: {} });
    LicenseManagerApiService.licenseBulkEnroll.mockReturnValue(mockPromiseResolve);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithEmailsSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    expect(button).toBeDisabled();
  });

  it('tests button is disabled when emails are not selected but courses are', () => {
    const mockPromiseResolve = Promise.resolve({ data: {} });
    LicenseManagerApiService.licenseBulkEnroll.mockReturnValue(mockPromiseResolve);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithCoursesSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    expect(button).toBeDisabled();
  });

  it('tests passing correct data to api call', () => {
    const mockPromiseResolve = Promise.resolve({ data: {} });
    LicenseManagerApiService.licenseBulkEnroll.mockReturnValue(mockPromiseResolve);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    userEvent.click(button);

    const expectedParams = {
      emails: userEmails,
      course_run_keys: courseNames,
      notify: true,
    };

    expect(LicenseManagerApiService.licenseBulkEnroll).toHaveBeenCalledWith(
      defaultProps.enterpriseId,
      expectedParams,
    );
    expect(logError).toBeCalledTimes(0);
  });

  it('tests notify toggle disables param to api service', () => {
    const mockPromiseResolve = Promise.resolve({ data: {} });
    LicenseManagerApiService.licenseBulkEnroll.mockReturnValue(mockPromiseResolve);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    const checkbox = screen.getByTestId(NOTIFY_CHECKBOX_TEST_ID);
    userEvent.click(checkbox);
    userEvent.click(button);

    const expectedParams = {
      emails: userEmails,
      course_run_keys: courseNames,
      notify: false,
    };
    expect(LicenseManagerApiService.licenseBulkEnroll).toHaveBeenCalledWith(
      defaultProps.enterpriseId,
      expectedParams,
    );
    expect(logError).toBeCalledTimes(0);
  });

  it('test component clears selected emails and courses after successful submit', async () => {
    const mockPromiseResolve = Promise.resolve({ data: {} });
    LicenseManagerApiService.licenseBulkEnroll.mockReturnValue(mockPromiseResolve);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    await userEvent.click(button);

    expect(emailsDispatch).toBeCalledTimes(1);
    expect(coursesDispatch).toBeCalledTimes(1);

    expect(emailsDispatch).toHaveBeenCalledWith(
      clearSelectionAction(),
    );
    expect(coursesDispatch).toHaveBeenCalledWith(
      clearSelectionAction(),
    );
    expect(logError).toBeCalledTimes(0);
  });

  it('tests component creates toast after successful submit', async () => {
    const mockPromiseResolve = Promise.resolve({ data: {} });
    LicenseManagerApiService.licenseBulkEnroll.mockReturnValue(mockPromiseResolve);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    await userEvent.click(button);

    expect(addToast).toBeCalledTimes(1);
    expect(logError).toBeCalledTimes(0);
    expect(addToast).toHaveBeenCalledWith(
      generateSuccessMessage(userEmails.length),
    );
  });

  it('tests component logs error response on unsuccessful api call', async () => {
    const mockPromiseReject = Promise.reject(new Error('something went wrong'));
    LicenseManagerApiService.licenseBulkEnroll.mockReturnValue(mockPromiseReject);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    await userEvent.click(button);
    await flushPromises();

    expect(addToast).toBeCalledTimes(0);
    expect(logError).toBeCalledTimes(1);
  });

  it('renders alert modal on unsuccessful api call', async () => {
    const mockPromiseReject = Promise.reject(new Error('something went wrong'));
    LicenseManagerApiService.licenseBulkEnroll.mockReturnValue(mockPromiseReject);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);

    await userEvent.click(button);
    await flushPromises();
    expect(screen.getByText(ALERT_MODAL_TITLE_TEXT)).toBeInTheDocument();
    expect(addToast).toBeCalledTimes(0);
  });

  it('alert modal closes when user clicks OK', async () => {
    const mockPromiseReject = Promise.reject(new Error('something went wrong'));
    LicenseManagerApiService.licenseBulkEnroll.mockReturnValue(mockPromiseReject);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    await userEvent.click(button);
    await flushPromises();
    const alertModalCloseButton = screen.getByText('OK');
    userEvent.click(alertModalCloseButton);
    expect(screen.queryByText(ALERT_MODAL_TITLE_TEXT)).not.toBeInTheDocument();
  });

  it('component calls return to initial step on successful api call', async () => {
    const mockPromiseResolve = Promise.resolve({ data: {} });
    LicenseManagerApiService.licenseBulkEnroll.mockReturnValue(mockPromiseResolve);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    await userEvent.click(button);
    expect(defaultProps.returnToInitialStep).toHaveBeenCalledTimes(1);
  });
});
