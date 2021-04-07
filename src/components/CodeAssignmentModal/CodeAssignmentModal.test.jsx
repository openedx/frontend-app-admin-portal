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
import CodeAssignmentModal, { BaseCodeAssignmentModal } from '.';
import { ASSIGNMENT_MODAL_FIELDS } from './constants';
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
      // eslint-disable-next-line react/prop-types
      Field: ({ label, ...rest }) => <div {...rest}>{label}</div>,
    }));
    // eslint-disable-next-line global-require, no-unused-vars
    const { Field } = require('redux-form');
    const error = 'Errors ahoy!';
    const props = { ...initialProps, error: [error], submitFailed: true };
    render(
      <MemoryRouter>
        <Provider store={mockStore(initialState)}>
          <BaseCodeAssignmentModal
            {...props}
          />
        </Provider>
      </MemoryRouter>,
    );

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
});
