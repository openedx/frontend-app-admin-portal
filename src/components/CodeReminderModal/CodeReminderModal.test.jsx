/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import remindEmailTemplate from './emailTemplate';
import { BaseCodeReminderModal } from '.';
import { displayCode, displayEmail, displaySelectedCodes } from '../CodeModal/codeModalHelpers';

import {
  EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
} from '../../data/constants/emailTemplate';
import { EMAIL_FORM_NAME } from '../EmailTemplateForm';

jest.mock('redux-form', () => ({
  ...jest.requireActual('redux-form'),
  Field: ({ label, component, ...rest }) => <div {...rest}>{label}</div>,
}));

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
  sendCodeReminder: () => {},
  couponDetailsTable: {
    data: {
      count: 1,
    },
  },
  initialValues: {},
  isBulkRemind: false,
  selectedToggle: 'toggle',
  data: {
    selectedCodes: [{ code: 'bulk', email: 'bulk2@foo.com' }],
    code: 'ind',
    email: 'ind@foo.com',
  },
  enableLearnerPortal: false,
  enterpriseSlug: 'bearsRus',

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
      remind: {
        'email-template-subject': remindEmailTemplate.subject,
        'email-template-greeting': remindEmailTemplate.greeting,
        'email-template-body': remindEmailTemplate.body,
        'email-template-closing': remindEmailTemplate.closing,
      },
    },
    remind: {
      'email-template-subject': remindEmailTemplate.subject,
      'email-template-greeting': remindEmailTemplate.greeting,
      'email-template-body': remindEmailTemplate.body,
      'email-template-closing': remindEmailTemplate.closing,
    },
  },
};

/* eslint-disable react/prop-types */
const CodeReminderModalWrapper = (props) => (
  <MemoryRouter>
    <Provider store={mockStore(initialState)}>
      <BaseCodeReminderModal
        {...initialProps}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);
/* eslint-enable react/prop-types */

describe('CodeReminderModal component', () => {
  it('displays a modal', () => {
    render(<CodeReminderModalWrapper />);
    expect(screen.getByText(initialProps.title)).toBeInTheDocument();
  });
  it('displays an error', () => {
    const error = 'Errors ahoy!';
    const props = { ...initialProps, error: [error], submitFailed: true };
    render(<CodeReminderModalWrapper {...props} />);
    expect(screen.getByText(error));
  });
  it('displays individual reminder data', () => {
    render(<CodeReminderModalWrapper />);
    expect(screen.getByText(displayCode(initialProps.data.code))).toBeInTheDocument();
    expect(screen.getByText(displayEmail(initialProps.data.email))).toBeInTheDocument();
  });
  it('displays bulk reminder data', () => {
    render(<CodeReminderModalWrapper isBulkRemind />);
    expect(screen.getByText(displaySelectedCodes(initialProps.data.selectedCodes.length))).toBeInTheDocument();
  });
  it('renders an email template form', () => {
    render(<CodeReminderModalWrapper />);
    expect(screen.getByText(EMAIL_FORM_NAME)).toBeInTheDocument();
  });
});
