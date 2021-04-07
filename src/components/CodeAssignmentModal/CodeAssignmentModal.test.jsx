/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';

import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import remindEmailTemplate from './emailTemplate';
import CodeAssignmentModal, {
  getTooManyAssignmentsMessage, getInvalidEmailMessage, ASSIGNMENT_MODAL_FIELDS, BaseCodeAssignmentModal, getErrors,
  textAreaKey, csvFileKey, NO_EMAIL_ADDRESS_ERROR, BOTH_TEXT_AREA_AND_CSV_ERROR,
} from '.';
import { displayCode, displaySelectedCodes } from '../CodeModal/codeModalHelpers';

import {
  EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
} from '../../data/constants/emailTemplate';
import { EMAIL_FORM_NAME } from '../EmailTemplateForm';

const sampleCodeData = {
  code: 'test-code-1',
  assigned_to: 'test@bestrun.com',
  redemptions: {
    total: 100,
    used: 10,
  },
  error: null,
};
const sampleTableData = {
  loading: false,
  error: null,
  data: {
    count: 3,
    num_pages: 2,
    current_page: 1,
    results: [
      sampleCodeData,
      {
        ...sampleCodeData,
        code: 'test-code-2',
        redemptions: {
          total: 100,
          used: 100,
        },
      },
      {
        ...sampleCodeData,
        code: 'test-code-3',
        assigned_to: null,
      },
    ],
  },
};

const initialProps = {
  handleSubmit: () => {},
  submitting: false,
  submitSucceeded: false,
  submitFailed: false,
  error: [],
  couponId: 12,
  title: 'Remind me',
  onClose: () => {},
  onSuccess: () => {},
  sendCodeAssignment: () => {},
  couponDetailsTable: {
    data: {
      count: 1,
    },
  },
  initialValues: {},
  isBulkRemind: false,
  selectedToggle: 'toggle',
  data: {
    selectedCodes: [{ code: 'bulk' }],
    unassignedCodes: 4,
    code: { code: 'ind' },
    remainingUses: 3,
    hasAllCodesSelected: false,
  },
  enableLearnerPortal: false,
  enterpriseSlug: 'bearsRus',
  setEmailAddress: () => {},
  enterpriseUuid: 'foo',
  createPendingEnterpriseUsers: () => {},
};

const mockStore = configureMockStore([thunk]);

const initialState = {
  table: {
    'coupon-details': sampleTableData,
  },
  emailTemplate: {
    loading: false,
    error: null,
    emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
    default: {
      assign: {
        'email-template-subject': remindEmailTemplate.subject,
        'email-template-greeting': remindEmailTemplate.greeting,
        'email-template-body': remindEmailTemplate.body,
        'email-template-closing': remindEmailTemplate.closing,
      },
    },
    assign: {
      'email-template-subject': remindEmailTemplate.subject,
      'email-template-greeting': remindEmailTemplate.greeting,
      'email-template-body': remindEmailTemplate.body,
      'email-template-closing': remindEmailTemplate.closing,
    },
  },
};

/* eslint-disable react/prop-types */
const CodeAssignmentModalWrapper = (props) => (
  <MemoryRouter>
    <Provider store={mockStore(initialState)}>
      <CodeAssignmentModal
        {...initialProps}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);
/* eslint-enable react/prop-types */

describe('CodeAssignmentModal component', () => {
  // beforeEach(() => jest.resetModules());

  it('displays a modal', () => {
    render(<CodeAssignmentModalWrapper />);
    expect(screen.getByText(initialProps.title)).toBeInTheDocument();
  });
  it.skip('displays an error', () => {
    jest.mock('redux-form', () => ({
      ...jest.requireActual('redux-form'),
      Field: ({ label, ...rest }) => <div {...rest}>{label}</div>,
    }));
    // eslint-disable-next-line global-require, no-unused-vars
    const { Field } = require('redux-form');
    const error = 'Errors ahoy!';
    const props = { ...initialProps, error: [error], submitFailed: true };
    render(<MemoryRouter>
      <Provider store={mockStore(initialState)}>
        <BaseCodeAssignmentModal
          {...props}
        />
      </Provider>
    </MemoryRouter>);

    // const submitButton = screen.getByTestId('submit-button');
    // userEvent.click(submitButton);

    expect(screen.getByText(error));
  });
  it('displays individual assignment data', () => {
    render(<CodeAssignmentModalWrapper />);
    expect(screen.getByText(displayCode(initialProps.data.code.code))).toBeInTheDocument();
  });
  it('displays bulk assign data', () => {
    render(<CodeAssignmentModalWrapper isBulkAssign />);
    expect(screen.getByText(displaySelectedCodes(initialProps.data.selectedCodes.length))).toBeInTheDocument();
  });
  it('renders an email template form', () => {
    render(<CodeAssignmentModalWrapper />);
    expect(screen.getByText(EMAIL_FORM_NAME)).toBeInTheDocument();
  });
  it('renders a auto-reminder checkbox', () => {
    render(<CodeAssignmentModalWrapper />);
    expect(screen.getByText(ASSIGNMENT_MODAL_FIELDS['enable-nudge-emails'].label)).toBeInTheDocument();
  });
  describe('getTooManyAssignmentsMessage', () => {
    it('displays the number of codes', () => {
      const result = getTooManyAssignmentsMessage({
        emails: ['foo@bar.com'],
        numCodes: 10,
        selected: false,
      });
      expect(result).toContain('You have 10');
    });
    it('pluralizes codes correctly', () => {
      const resultPlural = getTooManyAssignmentsMessage({
        emails: ['foo@bar.com'],
        numCodes: 10,
        selected: false,
      });
      const resultSingular = getTooManyAssignmentsMessage({
        emails: ['foo@bar.com'],
        numCodes: 1,
        selected: false,
      });
      expect(resultPlural).toContain('codes ');
      expect(resultSingular).toContain('code ');
    });
    it('shows selected or remaining codes', () => {
      const resultRemaining = getTooManyAssignmentsMessage({
        emails: ['foo@bar.com'],
        numCodes: 10,
        selected: false,
      });
      const resultSelected = getTooManyAssignmentsMessage({
        emails: ['foo@bar.com'],
        numCodes: 1,
        selected: true,
      });
      expect(resultRemaining).toContain('remaining');
      expect(resultSelected).toContain('selected');
    });
    it('gives the correct csv info', () => {
      const resultCSV = getTooManyAssignmentsMessage({
        emails: ['foo@bar.com'],
        numCodes: 10,
        selected: false,
        isCsv: true,
      });
      const resultNoCSV = getTooManyAssignmentsMessage({
        emails: ['foo@bar.com'],
        numCodes: 10,
        selected: false,
      });
      expect(resultCSV).toContain('your file has');
      expect(resultNoCSV).toContain('you entered');
    });
    it('has the correct email length', () => {
      const resultNoCSV = getTooManyAssignmentsMessage({
        emails: ['foo@bar.com', 'bears@bearmountain.com'],
        numCodes: 10,
        selected: false,
      });
      expect(resultNoCSV).toContain('2 emails');
    });
  });
  describe('getInvalidEmailMessage', () => {
    it('returns a message with the invalid email address', () => {
      const badEmail = 'bad@winnie.horse';
      const result = getInvalidEmailMessage([2, 5], ['good@nico.horse', 'nice@donkey.com', badEmail, 'awesome@mule.com']);
      expect(result).toContain(badEmail);
    });
    it('returns the line number of the email', () => {
      const badIndex = 1;
      const result = getInvalidEmailMessage([badIndex, 5], ['good@nico.horse', 'nice@donkey.com', 'awesome@mule.com']);
      expect(result).toContain(`line ${badIndex + 1}`);
    });
  });
  describe('getErrors', () => {
    const sampleInputCsv = {
      unassignedCodes: 1,
      numberOfSelectedCodes: 1,
      shouldValidateSelectedCodes: true,
      invalidCsvEmails: [0],
      validCsvEmails: ['another@me.com', 'yetOneMore@me.com'],
      csvEmails: ['you@you.com', 'onemore@horse.com'],
    };
    const sampleInputTextArea = {
      invalidTextAreaEmails: [1],
      textAreaEmails: ['me@me.com', 'foo@bar.com'],
      validTextAreaEmails: ['foo@bar.com', 'sue@bear.com'],
      ...sampleInputCsv,
    };
    it('returns an invalid email message for text area emails', () => {
      const result = getErrors(sampleInputTextArea);
      const errorMessage = getInvalidEmailMessage(sampleInputTextArea.invalidTextAreaEmails, sampleInputTextArea.textAreaEmails);
      const expected = {
        [textAreaKey]: errorMessage,
        _error: [errorMessage],
      };
      expect(result).toEqual(expected);
    });
    it('returns an too many assignments message for the text area', () => {
      const result = getErrors({ ...sampleInputTextArea, invalidTextAreaEmails: [] });
      const errorMessage = getTooManyAssignmentsMessage({
        emails: sampleInputTextArea.validTextAreaEmails, numCodes: sampleInputTextArea.unassignedCodes,
      });
      const expected = {
        [textAreaKey]: errorMessage,
        _error: [errorMessage],
      };
      expect(result).toEqual(expected);
    });
    it('returns too many assignments message when there are too many valid emails (text area)', () => {
      const result = getErrors({ ...sampleInputTextArea, invalidTextAreaEmails: [], unassignedCodes: 2 });
      const errorMessage = getTooManyAssignmentsMessage({
        emails: sampleInputTextArea.validTextAreaEmails, numCodes: sampleInputTextArea.numberOfSelectedCodes, selected: true,
      });
      const expected = {
        [textAreaKey]: errorMessage,
        _error: [errorMessage],
      };
      expect(result).toEqual(expected);
    });
    it('returns an invalid email message if there are invalid CSV emails', () => {
      const result = getErrors({ ...sampleInputCsv, unassignedCodes: 2 });
      const errorMessage = getInvalidEmailMessage(sampleInputTextArea.invalidCsvEmails, sampleInputTextArea.csvEmails);
      const expected = {
        [csvFileKey]: errorMessage,
        _error: [errorMessage],
      };
      expect(result).toEqual(expected);
    });
    it('returns too many assignments message for csv emails when there are more emails than codes', () => {
      const result = getErrors({ ...sampleInputCsv, invalidCsvEmails: [] });
      const errorMessage = getTooManyAssignmentsMessage({
        isCsv: true,
        emails: sampleInputCsv.validCsvEmails,
        numCodes: sampleInputCsv.unassignedCodes,
      });
      const expected = {
        [csvFileKey]: errorMessage,
        _error: [errorMessage],
      };
      expect(result).toEqual(expected);
    });
    it('returns too many assignments message for csv when there are more emails than selected codes', () => {
      const result = getErrors({
        ...sampleInputCsv, unassignedCodes: 2, invalidCsvEmails: [], selectedCodes: 3,
      });
      const errorMessage = getTooManyAssignmentsMessage({
        emails: sampleInputCsv.validCsvEmails, numCodes: sampleInputCsv.numberOfSelectedCodes, selected: true, isCsv: true,
      });
      const expected = {
        [csvFileKey]: errorMessage,
        _error: [errorMessage],
      };
      expect(result).toEqual(expected);
    });
    it('returns a no email addreses error if there are no email addresses', () => {
      const result = getErrors({ validTextAreaEmails: [], validCsvEmails: [] });
      expect(result).toEqual({ _error: [NO_EMAIL_ADDRESS_ERROR] });
    });
    it('returns an error if both text area and csv have emails', () => {
      const result = getErrors({ validTextAreaEmails: ['foo'], validCsvEmails: ['bar'] });
      expect(result).toEqual({ _error: [BOTH_TEXT_AREA_AND_CSV_ERROR] });
    });
  });
});
