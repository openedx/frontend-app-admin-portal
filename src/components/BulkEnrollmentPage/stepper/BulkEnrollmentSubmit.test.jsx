import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  cleanup, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logError } from '@edx/frontend-platform/logging';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import BulkEnrollmentSubmit, { BulkEnrollmentAlertModal, generateSuccessMessage } from './BulkEnrollmentSubmit';
import {
  ALERT_MODAL_TITLE_TEXT,
  CUSTOMER_SUPPORT_HYPERLINK_TEST_ID,
  FINAL_BUTTON_TEST_ID,
  NOTIFY_CHECKBOX_TEST_ID,
  SUPPORT_EMAIL_BODY,
  SUPPORT_EMAIL_SUBJECT,
} from './constants';
import { BulkEnrollContext } from '../BulkEnrollmentContext';
import { clearSelectionAction } from '../data/actions';
import { renderWithRouter } from '../../test/testUtils';
import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';
import { configuration } from '../../../config';

jest.mock('../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
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
  subscription: { uuid: 'foo', enterpriseCatalogUuid: 'bar' },
  onEnrollComplete: jest.fn(),
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
  (course) => ({
    values: {
      contentKey: course,
      advertisedCourseRun: {
        key: course,
      },
    },
  }),
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

const BulkEnrollmentSubmitWrapper = ({ bulkEnrollInfo = defaultBulkEnrollInfo, ...props }) => (
  <IntlProvider locale="en">
    <BulkEnrollContext.Provider value={bulkEnrollInfo}>
      <BulkEnrollmentSubmit {...props} />
    </BulkEnrollContext.Provider>
  </IntlProvider>
);

const BulkEnrollmentAlertModalWrapper = ({ alertProps = defaultAlertProps, ...props }) => (
  <IntlProvider locale="en">
    <BulkEnrollmentAlertModal {...alertProps} {...props} />
  </IntlProvider>
);

describe('generateSuccessMessage', () => {
  it('renders correct message based on enrollment count', () => {
    expect(generateSuccessMessage(0)).toBe('No learners have been enrolled.');
    expect(generateSuccessMessage(1)).toBe('1 learner has been enrolled.');
    expect(generateSuccessMessage(5)).toBe('5 learners have been enrolled.');
  });
});

describe('BulkEnrollmentAlertModal', () => {
  beforeEach(() => {
    defaultAlertProps.toggleClose.mockClear();
  });
  afterEach(() => {
    cleanup();
  });

  it('renders an alert', () => {
    render(<BulkEnrollmentAlertModalWrapper {...defaultAlertProps} />);
    expect(screen.getByText(ALERT_MODAL_TITLE_TEXT)).toBeInTheDocument();
  });

  it('links to support', async () => {
    renderWithRouter(
      <BulkEnrollmentAlertModalWrapper {...defaultAlertProps} />,
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

  it('calls toggleClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<BulkEnrollmentAlertModalWrapper {...defaultAlertProps} />);
    const closeButton = screen.getByText('OK');
    await user.click(closeButton);
    expect(defaultAlertProps.toggleClose).toHaveBeenCalledTimes(1);
  });
});

describe('BulkEnrollmentSubmit', () => {
  beforeEach(() => {
    emailsDispatch.mockClear();
    coursesDispatch.mockClear();
    logError.mockClear();
    defaultProps.onEnrollComplete.mockClear();
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

  it('tests button is disabled when courses are not selected but emails are', async () => {
    LicenseManagerApiService.licenseBulkEnroll.mockResolvedValue({ data: {} });

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithEmailsSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    expect(button).toBeDisabled();
  });

  it('tests button is disabled when emails are not selected but courses are', async () => {
    LicenseManagerApiService.licenseBulkEnroll.mockResolvedValue({ data: {} });

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithCoursesSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    expect(button).toBeDisabled();
  });

  it('tests passing correct data to api call', async () => {
    const user = userEvent.setup();
    LicenseManagerApiService.licenseBulkEnroll.mockResolvedValue({ data: {} });

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    await user.click(button);

    const expectedParams = {
      emails: userEmails,
      course_run_keys: courseNames,
      notify: true,
    };

    await waitFor(() => {
      expect(LicenseManagerApiService.licenseBulkEnroll).toHaveBeenCalledWith(
        defaultProps.enterpriseId,
        defaultProps.subscription.uuid,
        expectedParams,
      );
      expect(logError).toBeCalledTimes(0);
    });
  });

  it('tests notify toggle disables param to api service', async () => {
    const user = userEvent.setup();
    LicenseManagerApiService.licenseBulkEnroll.mockResolvedValue({ data: {} });

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    const checkbox = screen.getByTestId(NOTIFY_CHECKBOX_TEST_ID);
    await user.click(checkbox); // uncheck the box
    await user.click(button);

    const expectedParams = {
      emails: userEmails,
      course_run_keys: courseNames,
      notify: false,
    };

    await waitFor(() => {
      expect(LicenseManagerApiService.licenseBulkEnroll).toHaveBeenCalledWith(
        defaultProps.enterpriseId,
        defaultProps.subscription.uuid,
        expectedParams,
      );
      expect(logError).toBeCalledTimes(0);
    });
  });

  it('test component clears selected emails and courses after successful submit', async () => {
    const user = userEvent.setup();
    LicenseManagerApiService.licenseBulkEnroll.mockResolvedValue({ data: {} });

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    await user.click(button);

    await waitFor(() => {
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
  });

  it('tests component creates toast after successful submit', async () => {
    const user = userEvent.setup();
    LicenseManagerApiService.licenseBulkEnroll.mockResolvedValue({ data: {} });

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    await user.click(button);

    await waitFor(() => {
      expect(logError).toBeCalledTimes(0);
      expect(screen.getByText('been enrolled', { exact: false })).toBeInTheDocument();
    });
  });

  it('tests component logs error response on unsuccessful api call', async () => {
    const user = userEvent.setup();
    // eslint-disable-next-line prefer-promise-reject-errors
    const mockPromiseReject = new Error('something went wrong');
    LicenseManagerApiService.licenseBulkEnroll.mockRejectedValue(mockPromiseReject);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    await user.click(button);

    await waitFor(() => expect(logError).toBeCalledTimes(1));
  });

  it('renders alert modal on unsuccessful api call', async () => {
    const user = userEvent.setup();
    const mockPromiseReject = new Error('something went wrong');
    LicenseManagerApiService.licenseBulkEnroll.mockRejectedValue(mockPromiseReject);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);

    await user.click(button);

    await waitFor(() => expect(screen.getByText(ALERT_MODAL_TITLE_TEXT)).toBeInTheDocument());
  });

  it('alert modal closes when user clicks OK', async () => {
    const user = userEvent.setup();
    // eslint-disable-next-line prefer-promise-reject-errors
    const mockPromiseReject = new Error('something went wrong');
    LicenseManagerApiService.licenseBulkEnroll.mockRejectedValue(mockPromiseReject);

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = screen.getByTestId(FINAL_BUTTON_TEST_ID);
    await user.click(button);
    await waitFor(() => expect(screen.getByText('OK')).toBeInTheDocument());
    const alertModalCloseButton = await waitFor(() => screen.getByText('OK'));

    await user.click(alertModalCloseButton);
    await waitFor(() => expect(screen.queryByText(ALERT_MODAL_TITLE_TEXT)).not.toBeInTheDocument());
  });

  it('component calls return to initial step on successful api call', async () => {
    const user = userEvent.setup();
    LicenseManagerApiService.licenseBulkEnroll.mockResolvedValue({ data: {} });

    render(
      <BulkEnrollmentSubmitWrapper
        {...defaultProps}
        bulkEnrollInfo={bulkEnrollWithAllSelectedRows}
      />,
    );
    const button = await waitFor(() => screen.getByTestId(FINAL_BUTTON_TEST_ID));
    await user.click(button);
    await waitFor(() => {
      expect(screen.getByText('been enrolled', { exact: false })).toBeInTheDocument();
      expect(defaultProps.onEnrollComplete).toHaveBeenCalledTimes(1);
    });
  });
});
