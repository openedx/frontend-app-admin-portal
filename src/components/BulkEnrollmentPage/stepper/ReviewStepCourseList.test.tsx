import React from 'react';
import { screen, render, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import algoliasearch from 'algoliasearch/lite';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import '@testing-library/jest-dom/extend-expect';

import { BulkEnrollContext, BulkEnrollContextValue } from '../BulkEnrollmentContext';
import {
  BaseReviewStepCourseList,
  useSearchFiltersForSelectedCourses,
} from './ReviewStepCourseList';
import { UseAlgoliaSearchResult } from '../../algolia-search';

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('./ReviewList', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="review-list" />),
}));

const mockStore = configureMockStore({});

const mockCoursesDispatch = jest.fn();
const defaultBulkEnrollContext: BulkEnrollContextValue = {
  courses: [[{ id: 'foo' }], mockCoursesDispatch],
  emails: [[], jest.fn()],
  subscription: [null, jest.fn()],
};

const defaultAlgoliaProps: UseAlgoliaSearchResult = {
  catalogUuidsToCatalogQueryUuids: null,
  isLoading: false,
  isCatalogQueryFiltersEnabled: false,
  searchClient: null,
  securedAlgoliaApiKey: null,
};

const defaultProps = {
  returnToSelection: jest.fn(),
};

interface ReviewStepCourseListWrapperProps {
  bulkEnrollContextValue?: BulkEnrollContextValue;
  [key: string]: any;
}

const ReviewStepCourseListWrapper: React.FC<ReviewStepCourseListWrapperProps> = ({
  algolia = defaultAlgoliaProps,
  bulkEnrollContextValue = defaultBulkEnrollContext,
  ...rest
}) => (
  <Provider
    store={mockStore({
      portalConfiguration: {
        enterpriseId: 'test-enterprise-uuid',
        enterpriseFeatures: {},
      },
    })}
  >
    <BulkEnrollContext.Provider value={bulkEnrollContextValue}>
      <BaseReviewStepCourseList algolia={algolia} {...defaultProps} {...rest} />
    </BulkEnrollContext.Provider>
  </Provider>
);

describe('ReviewStepCourseList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAuthenticatedUser.mockReturnValue({
      userId: 3,
    });
  });

  it('renders search unavailable error', () => {
    render(<ReviewStepCourseListWrapper />);
    expect(screen.getByText('search functionality is currently unavailable', { exact: false })).toBeInTheDocument();
  });

  it('renders loading skeleton while secured algolia api key is loading', () => {
    const algolia = {
      ...defaultAlgoliaProps,
      isCatalogQueryFiltersEnabled: true,
      isLoading: true,
    } as UseAlgoliaSearchResult;
    render(<ReviewStepCourseListWrapper algolia={algolia} />);
    expect(screen.getByTestId('skeleton-algolia-loading-courses')).toBeInTheDocument();
  });

  it('updates `selectedCourses` in `BulkEnrollContext` with Algolia metadata', () => {
    const searchClient = algoliasearch('test-app-id', 'test-api-key');
    const algolia = {
      ...defaultAlgoliaProps,
      searchClient,
    } as UseAlgoliaSearchResult;
    render(<ReviewStepCourseListWrapper algolia={algolia} />);

    expect(mockCoursesDispatch).toHaveBeenCalledTimes(1);
    const expectedCourseSelection = {
      id: expect.any(String),
      values: expect.objectContaining({
        advertisedCourseRun: expect.any(Object),
        aggregationKey: expect.any(String),
        key: expect.any(String),
        objectId: expect.any(String),
        title: expect.any(String),
      }),
    };
    expect(mockCoursesDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: [expectedCourseSelection, expectedCourseSelection],
        type: 'SET SELECTED ROWS',
      }),
    );
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
