/* eslint-disable react/prop-types */

import React from 'react';
import { Provider } from 'react-redux';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import remindEmailTemplate from './emailTemplate';
import CodeRevokeModal from '.';

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
        assigned_to: 'winnie@bearmountain.horse',
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
  sendCodeRevoke: () => {},
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
    code: 'ind',
    remainingUses: 3,
    hasAllCodesSelected: false,
    assigned_to: 'winnie@bearmountain.horse',
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
const CodeRevokeModalWrapper = (props) => (
  <MemoryRouter>
    <Provider store={mockStore(initialState)}>
      <CodeRevokeModal
        {...initialProps}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);
/* eslint-enable react/prop-types */

describe('CodeRevokeModal component', () => {
  it('displays a modal', () => {
    render(<CodeRevokeModalWrapper />);
    expect(screen.getByText(initialProps.title)).toBeInTheDocument();
  });
  it('displays individual assignment data', () => {
    render(<CodeRevokeModalWrapper />);
    expect(screen.getByText(displayCode(initialProps.data.code))).toBeInTheDocument();
  });
  it('displays bulk assign data', () => {
    render(<CodeRevokeModalWrapper isBulkRevoke />);
    expect(screen.getByText(displaySelectedCodes(initialProps.data.selectedCodes.length))).toBeInTheDocument();
  });
  it('renders an email template form', () => {
    render(<CodeRevokeModalWrapper />);
    expect(screen.getByText(EMAIL_FORM_NAME)).toBeInTheDocument();
  });
  it('renders a auto-reminder checkbox', () => {
    render(<CodeRevokeModalWrapper />);
    expect(screen.getByText('Do not email')).toBeInTheDocument();
  });
});
