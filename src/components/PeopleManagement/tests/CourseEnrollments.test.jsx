import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import CourseEnrollments from '../LearnerDetailPage/CourseEnrollments';

jest.mock('../LearnerDetailPage/EnrollmentCard', () => (
  jest.fn(({ enrollment }) => (
    <div data-testid="enrollment-card">
      <span>{enrollment.displayName}</span>
    </div>
  ))
));

const mockStore = configureStore([]);

const mockEnrollments = {
  inProgress: [
    {
      uuid: '1',
      courseKey: 'course-1',
      displayName: 'Course 1',
      courseRunStatus: 'in_progress',
    },
  ],
  upcoming: [
    {
      uuid: '2',
      courseKey: 'course-2',
      displayName: 'Course 2',
      courseRunStatus: 'upcoming',
    },
  ],
  completed: [
    {
      uuid: '3',
      courseKey: 'course-3',
      displayName: 'Course 3',
      courseRunStatus: 'completed',
    },
  ],
  savedForLater: [
    {
      uuid: '5',
      courseKey: 'course-5',
      displayName: 'Course 5',
      courseRunStatus: 'saved_for_later',
    },
  ],
  assignmentsForDisplay: [
    {
      uuid: '4',
      courseKey: 'course-4',
      displayName: 'Course 4',
      courseRunStatus: 'assigned',
    },
  ],
};

const TestWrapper = ({ children, store }) => (
  <IntlProvider locale="en">
    <Provider store={store}>
      {children}
    </Provider>
  </IntlProvider>
);

describe('CourseEnrollments', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      portalConfiguration: {
        enterpriseSlug: 'test-enterprise',
      },
    });
  });

  const renderComponent = (props) => render(
    <TestWrapper store={store}>
      <CourseEnrollments {...props} />
    </TestWrapper>,
  );

  it('renders zero state message in a card when there are no enrollments', () => {
    renderComponent({ enrollments: {}, isLoading: false });
    expect(screen.getByText('This learner has not enrolled in any courses.')).toBeInTheDocument();
  });

  it('renders in-progress enrollments', () => {
    renderComponent({ enrollments: mockEnrollments, isLoading: false });
    const enrollmentCards = screen.getAllByTestId('enrollment-card');
    expect(enrollmentCards).toHaveLength(5);
    expect(screen.getByText('Course 1')).toBeInTheDocument();
  });

  it('renders upcoming enrollments', () => {
    renderComponent({ enrollments: mockEnrollments, isLoading: false });
    const enrollmentCards = screen.getAllByTestId('enrollment-card');
    expect(enrollmentCards).toHaveLength(5);
    expect(screen.getByText('Course 2')).toBeInTheDocument();
  });

  it('renders completed enrollments', () => {
    renderComponent({ enrollments: mockEnrollments, isLoading: false });
    const enrollmentCards = screen.getAllByTestId('enrollment-card');
    expect(enrollmentCards).toHaveLength(5);
    expect(screen.getByText('Course 3')).toBeInTheDocument();
  });

  it('renders assigned enrollments', () => {
    renderComponent({ enrollments: mockEnrollments, isLoading: false });
    const enrollmentCards = screen.getAllByTestId('enrollment-card');
    expect(enrollmentCards).toHaveLength(5);
    expect(screen.getByText('Course 4')).toBeInTheDocument();
  });

  it('renders saved for later enrollments', () => {
    renderComponent({ enrollments: mockEnrollments, isLoading: false });
    const enrollmentCards = screen.getAllByTestId('enrollment-card');
    expect(enrollmentCards).toHaveLength(5);
    expect(screen.getByText('Course 5')).toBeInTheDocument();
  });

  it('renders enrollments header', () => {
    renderComponent({ enrollments: mockEnrollments, isLoading: false });
    expect(screen.getByText('Enrollments')).toBeInTheDocument();
  });
});
