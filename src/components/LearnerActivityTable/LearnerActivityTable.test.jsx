import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import LearnerActivityTable from '.';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

jest.mock('../../data/services/EnterpriseDataApiService');
jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: { enterpriseId },
});

const defaultApiResponse = {
  data: {
    count: 0,
    num_pages: 1,
    results: [],
  },
};

const mockEnrollments = [
  {
    id: 1,
    passed_date: '2018-09-23T16:27:34.690065Z',
    course_title: 'Dive into ReactJS',
    course_key: 'edX/ReactJS',
    user_email: 'awesome.me@example.com',
    course_list_price: '200',
    course_start_date: '2017-10-21T23:47:32.738Z',
    course_end_date: '2018-05-13T12:47:27.534Z',
    current_grade: '0.66',
    progress_status: 'Failed',
    last_activity_date: '2018-09-22T10:59:28.628Z',
  },
  {
    id: 5,
    passed_date: '2018-09-22T16:27:34.690065Z',
    course_title: 'Redux with ReactJS',
    course_key: 'edX/Redux_ReactJS',
    user_email: 'new@example.com',
    course_list_price: '200',
    course_start_date: '2017-10-21T23:47:32.738Z',
    course_end_date: '2018-05-13T12:47:27.534Z',
    current_grade: '0.80',
    progress_status: 'Passed',
    last_activity_date: '2018-09-25T10:59:28.628Z',
  },
];

const dataApiResponse = {
  data: {
    count: 2,
    num_pages: 1,
    results: mockEnrollments,
  },
};

const Wrapper = props => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <Provider store={store}>
        <LearnerActivityTable {...props} />
      </Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('LearnerActivityTable', () => {
  beforeEach(() => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValue(defaultApiResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<Wrapper id="active-week" activity="active_past_week" />);
    expect(screen.queryByRole('table')).toBeInTheDocument();
  });

  it('renders empty state after loading with no results', async () => {
    render(<Wrapper id="active-week" activity="active_past_week" />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ learnerActivity: 'active_past_week', page: 1 }),
      );
    });
    await waitFor(() => {
      expect(screen.getByText('There are no results.')).toBeInTheDocument();
    });
  });

  it('renders error alert when the API call fails', async () => {
    const apiError = new Error('Network Error');
    EnterpriseDataApiService.fetchCourseEnrollments.mockRejectedValue(apiError);
    render(<Wrapper id="active-week" activity="active_past_week" />);
    await waitFor(() => {
      expect(screen.getByText('Unable to load data')).toBeInTheDocument();
    });
  });

  it('renders active learners table with all 9 columns including Passed Date', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValue(dataApiResponse);
    render(<Wrapper id="active-week" activity="active_past_week" />);
    await waitFor(() => {
      expect(screen.getByText('awesome.me@example.com')).toBeInTheDocument();
    });
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Course Title')).toBeInTheDocument();
    expect(screen.getByText('Course Price')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Passed Date')).toBeInTheDocument();
    expect(screen.getByText('Current Grade')).toBeInTheDocument();
    expect(screen.getByText('Progress Status')).toBeInTheDocument();
    expect(screen.getByText('Last Activity Date')).toBeInTheDocument();
  });

  it('renders inactive past week table without Passed Date column', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValue(dataApiResponse);
    render(<Wrapper id="inactive-week" activity="inactive_past_week" />);
    await waitFor(() => {
      expect(screen.getByText('awesome.me@example.com')).toBeInTheDocument();
    });
    expect(screen.queryByText('Passed Date')).not.toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Last Activity Date')).toBeInTheDocument();
  });

  it('renders inactive past month table without Passed Date column', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValue(dataApiResponse);
    render(<Wrapper id="inactive-month" activity="inactive_past_month" />);
    await waitFor(() => {
      expect(screen.getByText('awesome.me@example.com')).toBeInTheDocument();
    });
    expect(screen.queryByText('Passed Date')).not.toBeInTheDocument();
  });

  it('renders formatted cell values for active learners', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValue(dataApiResponse);
    render(<Wrapper id="active-week" activity="active_past_week" />);
    await waitFor(() => {
      expect(screen.getByText('awesome.me@example.com')).toBeInTheDocument();
    });
    expect(screen.getAllByText('$200').length).toBeGreaterThan(0);
    expect(screen.getByText('66%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('Dive into ReactJS')).toBeInTheDocument();
  });

  it('calls fetchCourseEnrollments with correct learnerActivity param', async () => {
    render(<Wrapper id="inactive-week" activity="inactive_past_week" />);
    await waitFor(() => {
      expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
        enterpriseId,
        expect.objectContaining({ learnerActivity: 'inactive_past_week', page: 1 }),
      );
    });
  });
});
