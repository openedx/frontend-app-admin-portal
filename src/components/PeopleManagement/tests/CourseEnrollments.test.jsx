import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CourseEnrollments from '../LearnerDetailPage/CourseEnrollments';

jest.mock('../LearnerDetailPage/EnrollmentCard', () => (
  jest.fn(() => <div data-testid="enrollment-card" />)));

const mockStore = configureStore([]);

describe('CourseEnrollments', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      portalConfiguration: {
        enterpriseSlug: 'test-enterprise',
      },
    });
  });

  it('renders enrollments when not loading', () => {
    const mockEnrollments = {
      completed: [
        { id: '1', courseKey: 'course-1', displayName: 'Completed Course' },
      ],
      inProgress: [
        { id: '2', courseKey: 'course-2', displayName: 'In Progress Course' },
      ],
      upcoming: [
        { id: '3', courseKey: 'course-3', displayName: 'Upcoming Course' },
      ],
      assignmentsForDisplay: [
        { id: '4', courseKey: 'course-4', displayName: 'Assigned Course' },
      ],
    };

    render(
      <Provider store={store}>
        <CourseEnrollments enrollments={mockEnrollments} isLoading={false} />
      </Provider>,
    );

    expect(screen.getByText('Enrollments')).toBeInTheDocument();

    const enrollmentCards = screen.getAllByTestId('enrollment-card');
    expect(enrollmentCards).toHaveLength(4); // One for each category
  });

  it('renders empty state when no enrollments', () => {
    const emptyEnrollments = {
      completed: [],
      inProgress: [],
      upcoming: [],
      assignmentsForDisplay: [],
    };

    render(
      <Provider store={store}>
        <CourseEnrollments enrollments={emptyEnrollments} isLoading={false} />
      </Provider>,
    );

    expect(screen.getByText('Enrollments')).toBeInTheDocument();

    const enrollmentCards = screen.queryAllByTestId('enrollment-card');
    expect(enrollmentCards).toHaveLength(0);
  });

  it('renders only available enrollment categories', () => {
    const partialEnrollments = {
      completed: [
        { id: '1', courseKey: 'course-1', displayName: 'Completed Course' },
      ],
      inProgress: [],
      upcoming: [
        { id: '3', courseKey: 'course-3', displayName: 'Upcoming Course' },
      ],
      assignmentsForDisplay: [],
    };

    render(
      <Provider store={store}>
        <CourseEnrollments enrollments={partialEnrollments} isLoading={false} />
      </Provider>,
    );

    expect(screen.getByText('Enrollments')).toBeInTheDocument();

    const enrollmentCards = screen.getAllByTestId('enrollment-card');
    expect(enrollmentCards).toHaveLength(2); // One for completed, one for upcoming
  });
});
