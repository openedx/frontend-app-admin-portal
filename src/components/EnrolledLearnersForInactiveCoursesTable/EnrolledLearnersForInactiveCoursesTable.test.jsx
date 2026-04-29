import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

import EnrolledLearnersForInactiveCoursesTable from '.';
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
        id: 1,
        enterprise_id: '72416e52-8c77-4860-9584-15e5b06220fb',
        lms_user_id: 11,
        enterprise_user_id: 222,
        user_email: 'test_user_1@example.com',
        user_username: 'test_user_1',
        last_activity_date: '2017-06-23',
        enrollment_count: 2,
        course_completion_count: 1,
      },
      {
        id: 2,
        enterprise_id: '72416e52-8c77-4860-9584-15e5b06220fb',
        lms_user_id: 22,
        enterprise_user_id: 333,
        user_email: 'test_user_2@example.com',
        user_username: 'test_user_2',
        last_activity_date: '2018-01-15',
        enrollment_count: 5,
        course_completion_count: 5,
      },
      {
        id: 3,
        enterprise_id: '72416e52-8c77-4860-9584-15e5b06220fb',
        lms_user_id: 33,
        enterprise_user_id: 444,
        user_email: 'test_user_3@example.com',
        user_username: 'test_user_3',
        last_activity_date: '2017-11-18',
        enrollment_count: 6,
        course_completion_count: 4,
      },
    ],
  },
};

const EnrolledLearnersForInactiveCoursesWrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <EnrolledLearnersForInactiveCoursesTable {...props} />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('EnrolledLearnersForInactiveCoursesTable', () => {
  beforeEach(() => {
    EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses.mockResolvedValue(emptyApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state correctly', async () => {
    render(<EnrolledLearnersForInactiveCoursesWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ page: 1 }),
      );
    });
    expect(await screen.findByText('No results found.')).toBeInTheDocument();
  });

  it('renders column headers correctly', async () => {
    render(<EnrolledLearnersForInactiveCoursesWrapper />);
    expect(await screen.findByText('Email')).toBeInTheDocument();
    expect(await screen.findByText('Total Course Enrollment Count')).toBeInTheDocument();
    expect(await screen.findByText('Total Completed Courses Count')).toBeInTheDocument();
    expect(await screen.findByText('Last Activity Date')).toBeInTheDocument();
  });

  it('renders learner data correctly', async () => {
    EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses.mockResolvedValue(populatedApiResponse);
    render(<EnrolledLearnersForInactiveCoursesWrapper />);
    await waitFor(() => {
      expect(screen.getByText('test_user_1@example.com')).toBeInTheDocument();
    });
    expect(screen.getByText('test_user_2@example.com')).toBeInTheDocument();
    expect(screen.getByText('test_user_3@example.com')).toBeInTheDocument();
    expect(screen.getByText('June 23, 2017')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2018')).toBeInTheDocument();
    expect(screen.getByText('November 18, 2017')).toBeInTheDocument();
  });

  it('calls fetchEnrolledLearnersForInactiveCourses with correct parameters', async () => {
    render(<EnrolledLearnersForInactiveCoursesWrapper />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({
          page: 1,
          page_size: 50,
        }),
      );
    });
  });
});
