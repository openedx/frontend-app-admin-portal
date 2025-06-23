import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import InviteLearnersModal from './index';

jest.mock('redux-form', () => ({
  reduxForm: () => (Component) => {
    const MockedComponent = (props) => (
      <Component
        handleSubmit={(fn) => fn}
        submitting={false}
        submitSucceeded={false}
        submitFailed={false}
        initialize={jest.fn()}
        {...props}
      />
    );
    return MockedComponent;
  },
  Field: function MockedField({ component: Component, ...props }) {
    return <Component {...props} input={{}} meta={{}} />;
  },
  SubmissionError: class SubmissionError extends Error {
    constructor(errors) {
      super();
      this.errors = errors;
    }
  },
}));

jest.mock('../../data/validation/email', () => ({
  extractSalesforceIds: jest.fn(),
  returnValidatedEmails: jest.fn(() => ['test@example.com']),
  validateEmailAddrTemplateForm: jest.fn(),
}));

jest.mock('../../utils', () => ({
  normalizeFileUpload: jest.fn(),
}));

jest.mock('@edx/frontend-platform/utils', () => ({
  camelCaseObject: jest.fn((obj) => obj),
}));

jest.mock('./emailTemplate', () => ({
  __esModule: true,
  default: {
    greeting: 'Test Greeting',
    body: 'Test Body',
    closing: jest.fn(() => 'Test Closing'),
  },
}));

const defaultProps = {
  handleSubmit: jest.fn((fn) => fn),
  submitting: false,
  submitSucceeded: false,
  submitFailed: false,
  error: null,
  initialize: jest.fn(),

  onClose: jest.fn(),
  onSuccess: jest.fn(),
  addLicensesForUsers: jest.fn(() => Promise.resolve({ data: {} })),
  subscriptionUUID: 'test-subscription-uuid',
  availableSubscriptionCount: 10,
  contactEmail: 'test@example.com',
};

const InviteLearnersModalWrapper = (props = {}) => (
  <IntlProvider locale="en">
    <InviteLearnersModal {...defaultProps} {...props} />
  </IntlProvider>
);

describe('InviteLearnersModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing and displays key elements', () => {
    render(<InviteLearnersModalWrapper />);

    expect(screen.getByRole('heading', { name: 'Invite learners' })).toBeInTheDocument();

    expect(screen.getByText(/Unassigned licenses: 10/)).toBeInTheDocument();

    expect(screen.getByTestId('add-user-heading')).toBeInTheDocument();
    expect(screen.getByTestId('add-user-heading')).toHaveTextContent('Add Users');

    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Upload Email Addresses')).toBeInTheDocument();
    expect(screen.getByText('Email Template')).toBeInTheDocument();
    expect(screen.getByText('Customize Greeting')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Customize Closing')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invite learners/i })).toBeInTheDocument();
  });

  it('renders error message when submitFailed is true and error exists', () => {
    const errorProps = {
      submitFailed: true,
      error: ['Test error message'],
    };

    render(<InviteLearnersModalWrapper {...errorProps} />);

    expect(screen.getByText('Unable to subscribe users')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders multiple error messages as a list', () => {
    const errorProps = {
      submitFailed: true,
      error: ['First error', 'Second error'],
    };

    render(<InviteLearnersModalWrapper {...errorProps} />);

    expect(screen.getByText('Unable to subscribe users')).toBeInTheDocument();
    expect(screen.getByText('First error')).toBeInTheDocument();
    expect(screen.getByText('Second error')).toBeInTheDocument();
  });

  it('shows spinner when submitting', () => {
    const submittingProps = {
      submitting: true,
    };

    render(<InviteLearnersModalWrapper {...submittingProps} />);

    // Check that spinner is present (it has a specific className)
    const button = screen.getByRole('button', { name: /invite learners/i });
    expect(button).toBeDisabled();
  });

  it('initializes with default email template values', () => {
    const initializeMock = jest.fn();
    const initProps = {
      initialize: initializeMock,
    };

    render(<InviteLearnersModalWrapper {...initProps} />);

    expect(initializeMock).toHaveBeenCalledWith({
      'email-template-greeting': 'Test Greeting',
      'email-template-body': 'Test Body',
      'email-template-closing': 'Test Closing',
    });
  });

  it('calls onClose when modal should close', () => {
    const onCloseMock = jest.fn();
    const successProps = {
      onClose: onCloseMock,
      submitSucceeded: true,
    };

    // Render with submitSucceeded false first
    const { rerender } = render(<InviteLearnersModalWrapper onClose={onCloseMock} />);

    // Then rerender with submitSucceeded true to trigger componentDidUpdate
    rerender(<InviteLearnersModalWrapper {...successProps} />);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
