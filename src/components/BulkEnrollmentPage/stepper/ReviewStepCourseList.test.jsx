import React from 'react';
import { screen, render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks/dom';
import '@testing-library/jest-dom/extend-expect';

import { BulkEnrollContext } from '../BulkEnrollmentContext';
import ReviewStepCourseList, {
  useSearchFiltersForSelectedCourses,
} from './ReviewStepCourseList';

jest.mock('./ReviewList', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="review-list" />),
}));

const mockCoursesDispatch = jest.fn();
const defaultBulkEnrollContext = {
  courses: [[{ id: 'foo' }], mockCoursesDispatch],
};

const defaultProps = {
  returnToSelection: jest.fn(),
};

/* eslint-disable react/prop-types */
const ReviewStepCourseListWrapper = ({
  bulkEnrollContextValue = defaultBulkEnrollContext,
  ...rest
}) => (
/* eslint-enable react/prop-types */
  <BulkEnrollContext.Provider value={bulkEnrollContextValue}>
    <ReviewStepCourseList {...defaultProps} {...rest} />
  </BulkEnrollContext.Provider>
);

describe('ReviewStepCourseList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders expected subcomponents', () => {
    render(<ReviewStepCourseListWrapper />);
    expect(screen.getByTestId('algolia__InstantSearch')).toBeInTheDocument();
    expect(screen.getByTestId('algolia__Configure')).toBeInTheDocument();
    expect(screen.getByTestId('review-list')).toBeInTheDocument();
  });
});

describe('useSearchFiltersForSelectedCourses', () => {
  it('computes a valid Algolia search filter for selected courses', () => {
    const args = [
      { id: 'course:edX+DemoX' },
      { id: 'course:edX+E2E' },
    ];
    const { result } = renderHook(() => useSearchFiltersForSelectedCourses(args));
    const expectedFilterString = args.map(r => `aggregation_key:'${r.id}'`).join(' OR ');
    expect(result.current).toEqual(expectedFilterString);
  });
});
