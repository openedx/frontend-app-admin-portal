import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

import EnrollmentsTable from './index';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

jest.mock('../../data/services/EnterpriseDataApiService');

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
});

const emptyApiResponse = {
  data: {
    count: 0,
    num_pages: 0,
    current_page: 1,
    results: [],
  },
};

const populatedApiResponse = {
  data: {
    count: 3,
    num_pages: 1,
    current_page: 1,
    results: [
      {
        user_email: 'learner_one@example.com',
        user_first_name: 'Learner',
        user_last_name: 'One',
        course_title: 'Intro to Testing',
        course_list_price: '99.00',
        course_start_date: '2022-01-01T00:00:00Z',
        course_end_date: '2022-06-01T00:00:00Z',
        passed_date: '2022-05-01T00:00:00Z',
        current_grade: 0.88,
        progress_status: 'Passed',
        last_activity_date: '2022-05-15T00:00:00Z',
        enrollment_date: '2021-12-01T00:00:00Z',
        user_account_creation_date: '2021-11-01T00:00:00Z',
      },
      {
        user_email: 'learner_two@example.com',
        user_first_name: 'Learner',
        user_last_name: 'Two',
        course_title: 'Advanced Testing',
        course_list_price: null,
        course_start_date: '2022-02-01T00:00:00Z',
        course_end_date: null,
        passed_date: null,
        current_grade: 0.45,
        progress_status: 'In Progress',
        last_activity_date: '2022-04-10T00:00:00Z',
        enrollment_date: '2022-01-15T00:00:00Z',
        user_account_creation_date: '2021-11-01T00:00:00Z',
      },
    ],
  },
};

const EnrollmentsWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <EnrollmentsTable {...props} />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('EnrollmentsTable', () => {
  beforeEach(() => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValue(emptyApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state correctly', async () => {
    render(<EnrollmentsWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ page: 1 }),
      );
    });
    expect(await screen.findByText('There are no results.')).toBeInTheDocument();
  });

  it('renders a group-specific no results warning message when the filter is applied', async () => {
    Object.defineProperty(window, 'location', {
      value: { search: '?group_uuid=test_uuid123' },
      writable: true,
    });
    render(<EnrollmentsWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalled();
    });
    const emptyMessage = 'We are currently processing the latest updates. The data is refreshed twice a day. Thank you for your patience, and please check back soon.';
    expect(await screen.findByText(emptyMessage)).toBeInTheDocument();
    // restore
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
    });
  });

  it('renders column headers correctly', async () => {
    render(<EnrollmentsWrapper />);
    expect(await screen.findByText('Email')).toBeInTheDocument();
    expect(await screen.findByText('Course Title')).toBeInTheDocument();
    expect(await screen.findByText('Current Grade')).toBeInTheDocument();
    expect(await screen.findByText('Progress Status')).toBeInTheDocument();
    expect(await screen.findByText('Last Activity Date')).toBeInTheDocument();
  });

  it('renders enrollment data with formatted values', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValue(populatedApiResponse);
    render(<EnrollmentsWrapper />);
    await waitFor(() => {
      expect(screen.getByText('learner_one@example.com')).toBeInTheDocument();
    });
    expect(screen.getByText('learner_two@example.com')).toBeInTheDocument();
    expect(screen.getByText('Intro to Testing')).toBeInTheDocument();
    expect(screen.getByText('$99.00')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('calls fetchCourseEnrollments with correct parameters', async () => {
    render(<EnrollmentsWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({
          page: 1,
          page_size: 50,
        }),
      );
    });
  });
});
