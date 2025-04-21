/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen, fireEvent } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { reduxForm } from 'redux-form';
import RequestCodesForm from './RequestCodesForm';
import messages from './messages';

jest.mock('redux-form', () => ({
  ...jest.requireActual('redux-form'),
  Field: ({ label, ...rest }) => <div {...rest}>{label}</div>,
}));

const mockIntl = {
  formatMessage: message => message.defaultMessage,
};

const mockStore = configureMockStore([thunk]);

const defaultFormValues = {
  emailAddress: 'test@example.com',
  enterpriseName: 'Test Enterprise',
  numberOfCodes: '5',
  notes: 'Some notes',
};

const defaultStoreState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
    enterpriseSlug: 'test-enterprise-slug',
  },
  coupons: {
    loading: false,
    error: null,
    data: {
      count: 0,
      results: [],
    },
  },
  table: {
    'coupon-details': {},
  },
  form: {
    'request-codes-form': {
      values: defaultFormValues,
    },
  },
};

const defaultProps = {
  handleSubmit: jest.fn(),
  submitting: false,
  submitSucceeded: false,
  submitFailed: false,
  error: null,
  intl: mockIntl,
  initialValues: defaultFormValues,
  url: '/test/request',
};

const WrappedRequestCodesForm = reduxForm({ form: 'request-codes-form' })(RequestCodesForm);

const renderComponent = (props = {}, storeOverride = defaultStoreState) => {
  const store = mockStore(storeOverride);
  return render(
    <MemoryRouter>
      <Provider store={store}>
        <IntlProvider locale="en">
          <WrappedRequestCodesForm {...props} />
        </IntlProvider>
      </Provider>
    </MemoryRouter>,
  );
};

describe('RequestCodesForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields and values', () => {
    renderComponent(defaultProps);

    expect(screen.getByText(messages.emailLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.companyLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.numberOfCodesLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.notesLabel.defaultMessage)).toBeInTheDocument();
  });

  it('displays error alert with correct text', () => {
    const errorState = {
      ...defaultStoreState,
      form: {
        'request-codes-form': {
          values: defaultFormValues,
          submitFailed: true,
          error: { message: 'Some error occurred' },
        },
      },
    };

    renderComponent({ url: '/test/request', intl: mockIntl }, errorState);

    expect(screen.getByText(/Unable to request more codes/i)).toBeInTheDocument();
    expect(screen.getByText(/Some error occurred/i)).toBeInTheDocument();
  });

  it('submits form when valid', () => {
    const handleSubmitMock = jest.fn();
    const props = {
      ...defaultProps,
      handleSubmit: handleSubmitMock,
    };
    renderComponent(props);

    const submitButton = screen.getByRole('button', { name: /Request Codes/i });
    fireEvent.click(submitButton);

    expect(handleSubmitMock).toHaveBeenCalled();
  });
});
