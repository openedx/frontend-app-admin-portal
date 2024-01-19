import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CouponDetails from './index';
import { COUPON_FILTERS, DEFAULT_TABLE_COLUMNS } from './constants';
import { EMAIL_TEMPLATE_SOURCE_NEW_EMAIL } from '../../data/constants/emailTemplate';
import { MULTI_USE } from '../../data/constants/coupons';

const mockStore = configureMockStore([thunk]);

const sampleEmailTemplate = {
  'email-address': '',
  'email-template-greeting': 'Sample email greeting.. ',
  'email-template-body': 'Sample email body template.. ',
  'email-template-closing': 'Sample email closing template.. ',
  'email-template-files': [{ name: 'file1.png', size: 123, contents: '' }, { name: 'file2.png', size: 456, contents: '' }],
};

const emailDefaults = {
  'template-id': 0,
  'email-address': '',
  'template-name-select': '',
  'email-template-subject': 'Sample email subject.. ',
  'email-template-greeting': 'Sample email greeting.. ',
  'email-template-body': 'Sample email body template.. ',
  'email-template-closing': 'Sample email closing template.. ',
  'email-template-files': [{ name: 'file1.png', size: 123, contents: '' }, { name: 'file2.png', size: 456, contents: '' }],
};

const sampleCodeData = {
  code: 'test-code-1',
  assigned_to: 'test@bestrun.com',
  redemptions: {
    total: 100,
    used: 10,
    num_assignments: 5,
  },
  assignment_date: 'June 02, 2020 13:09',
  last_reminder_date: 'June 22, 2020 12:01',
  revocation_date: '',
  error: null,
  is_public: true,
};

const sampleTableData = {
  loading: false,
  error: null,
  data: {
    count: 5,
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
          num_assignments: 0,
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
const reduxState = {
  portalConfiguration: {
    enterpriseId: 'LaelCo',
    enterpriseSlug: 'bearsRus',
    enableLearnerPortal: true,
  },
  csv: {
    'coupon-details': {},
  },
  table: {
    'coupon-details': sampleTableData,
  },
  form: {
    'code-assignment-modal-form': {
      values: {
        'email-address': '',
      },
    },
  },
  coupons: {
    couponOverviewLoading: false,
    couponOverviewError: null,
  },
  emailTemplate: {
    loading: false,
    error: null,
    emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
    default: {
      assign: sampleEmailTemplate,
      remind: sampleEmailTemplate,
      revoke: sampleEmailTemplate,
    },
    assign: emailDefaults,
    remind: emailDefaults,
    revoke: emailDefaults,
  },
};

const couponData = {
  id: 2,
  title: 'LaelCoupon',
  errors: [],
  num_assigned: 2,
  usage_limitation: MULTI_USE,
  available: true,
  num_unassigned: 90,
};

const defaultProps = {
  fetchCouponOrder: () => {},
  couponDetailsTable: {
    data: sampleTableData.data,
    loading: false,
  },
  couponData,
  isExpanded: true,
};

const CouponDetailsWrapper = props => (
  <MemoryRouter>
    <Provider store={mockStore(reduxState)}>
      <IntlProvider locale="en">
        <CouponDetails
          {...props}
        />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

// NOTE: Further integration testing can be found in src/containers/CouponDetails.test.jsx

describe('CouponDetails component', () => {
  it('does not display contents when not expanded', () => {
    render(<CouponDetailsWrapper {...defaultProps} isExpanded={false} />);
    expect(screen.queryByText('Coupon Details')).not.toBeInTheDocument();
  });
  it('renders an expanded page', () => {
    render(<CouponDetailsWrapper {...defaultProps} />);
    expect(screen.getByText('Coupon Details')).toBeInTheDocument();
    expect(screen.getByText('Download full report (CSV)')).toBeInTheDocument();
  });
  it('renders the unassigned table by default', () => {
    render(<CouponDetailsWrapper {...defaultProps} />);
    expect(screen.getByText(COUPON_FILTERS.unassigned.label)).toBeInTheDocument();
    DEFAULT_TABLE_COLUMNS.unassigned.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
  it('renders with error state', () => {
    render(<CouponDetailsWrapper
      {...defaultProps}
      couponData={{
        ...couponData,
        errors: [{ code: 'test-code-1', user_email: 'test@bestrun.com' }],
      }}
    />);
    userEvent.selectOptions(screen.getByLabelText('Filter by code status'), COUPON_FILTERS.unredeemed.label);
    expect(screen.getByText('An error has occurred:', { exact: false })).toBeInTheDocument();
  });
});
