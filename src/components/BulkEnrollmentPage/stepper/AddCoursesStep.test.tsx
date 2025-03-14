import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useMemo } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import userEvent from '@testing-library/user-event';

import { ADD_COURSES_TITLE, WARNING_ALERT_TITLE_TEXT } from './constants';
import { BulkEnrollContext, BulkEnrollContextValue, Subscription } from '../BulkEnrollmentContext';
import { TABLE_HEADERS } from '../CourseSearchResults';

import '../../../../__mocks__/react-instantsearch-dom';
import { BaseAddCoursesStep } from './AddCoursesStep';
import { renderWithRouter } from '../../test/testUtils';
import { SelectedRow } from '../data/reducer';
import { UseAlgoliaSearchResult } from '../../algolia-search/useAlgoliaSearch';

const mockEnterpriseCatalogUuid = 'fake-enterprise-catalog-uuid';
const mockEnterpriseCatalogQueryUuid = 'fake-enterprise-catalog-query-uuid';
const mockSubscription: Subscription = {
  uuid: 'fake-subscription-uuid',
  enterpriseCatalogUuid: mockEnterpriseCatalogUuid,
};

const defaultProps = {
  subscriptionUUID: 'fakest-uuid',
  enterpriseSlug: 'sluggy',
  subscription: mockSubscription,
  enterpriseId: 'fancyEnt',
};

const mockSelectedCourses: SelectedRow[] = [...Array(3).keys()].map(idx => ({
  id: `course-${idx}`,
  values: {
    title: `edX Demo Course ${idx}`,
    userEmail: 'edx@example.com',
  },
}));
const mockSelectedEmails: SelectedRow[] = [];

const defaultAlgoliaProps: UseAlgoliaSearchResult = {
  catalogUuidsToCatalogQueryUuids: null,
  isLoading: false,
  isCatalogQueryFiltersEnabled: false,
  searchClient: null,
  securedAlgoliaApiKey: null,
};

const mockStore = configureMockStore([thunk]);

const defaultMockStore = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-uuid',
    enterpriseSlug: 'test-enterprise-slug',
    enterpriseFeatures: {},
  },
});

interface StepperWrapperProps {
  store?: ReturnType<typeof mockStore>;
  algolia?: UseAlgoliaSearchResult;
  selectedCourses?: SelectedRow[];
  selectedEmails?: SelectedRow[];
  subscription?: Subscription;
}

const StepperWrapper = ({
  store,
  algolia,
  selectedCourses = mockSelectedCourses,
  selectedEmails = mockSelectedEmails,
  subscription = mockSubscription,
  ...props
}: StepperWrapperProps) => {
  const value = useMemo(
    () => ({
      courses: [selectedCourses, () => {}],
      emails: [selectedEmails, () => {}],
      subscription: [defaultProps.subscription, () => {}],
    }) as BulkEnrollContextValue,
    [selectedCourses, selectedEmails],
  );

  return (
    <IntlProvider locale="en">
      <Provider store={store || defaultMockStore}>
        <BulkEnrollContext.Provider value={value}>
          <BaseAddCoursesStep
            {...props}
            algolia={algolia || defaultAlgoliaProps}
            subscription={subscription}
          />
        </BulkEnrollContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

describe('AddCoursesStep', () => {
  it('displayed skeleton while loading secured Algolia API key', () => {
    const algolia: UseAlgoliaSearchResult = {
      ...defaultAlgoliaProps,
      isCatalogQueryFiltersEnabled: true,
      isLoading: true,
    };
    renderWithRouter(<StepperWrapper {...defaultProps} algolia={algolia} />);
    expect(screen.getByTestId('skeleton-algolia-loading-courses')).toBeInTheDocument();
  });

  it.each([
    { usesCatalogQuerySearchFilters: false },
    { usesCatalogQuerySearchFilters: true },
  ])('displays expected UI (%s)', ({ usesCatalogQuerySearchFilters }) => {
    const algolia: UseAlgoliaSearchResult = {
      ...defaultAlgoliaProps,
      isCatalogQueryFiltersEnabled: usesCatalogQuerySearchFilters,
      catalogUuidsToCatalogQueryUuids: usesCatalogQuerySearchFilters
        ? { [mockEnterpriseCatalogUuid]: mockEnterpriseCatalogQueryUuid }
        : null,
    };
    renderWithRouter(<StepperWrapper {...defaultProps} algolia={algolia} />);

    // Title
    expect(screen.getByText(ADD_COURSES_TITLE)).toBeInTheDocument();

    // Table
    expect(screen.getByText(TABLE_HEADERS.courseName)).toBeInTheDocument();
    expect(screen.getByText(TABLE_HEADERS.courseAvailability)).toBeInTheDocument();

    // No warning alert should be displayed
    expect(screen.queryByText(WARNING_ALERT_TITLE_TEXT)).not.toBeInTheDocument();
  });

  it.each([
    { usesCatalogQuerySearchFilters: false },
    { usesCatalogQuerySearchFilters: true },
  ])('more than max selected courses causes display of warning dialog text', async ({ usesCatalogQuerySearchFilters }) => {
    const algolia: UseAlgoliaSearchResult = {
      ...defaultAlgoliaProps,
      isCatalogQueryFiltersEnabled: usesCatalogQuerySearchFilters,
      catalogUuidsToCatalogQueryUuids: usesCatalogQuerySearchFilters
        ? { [mockEnterpriseCatalogUuid]: mockEnterpriseCatalogQueryUuid }
        : null,
    };
    renderWithRouter(
      <StepperWrapper
        {...defaultProps}
        algolia={algolia}
        selectedCourses={[...Array(8).keys()].map(idx => ({
          id: `course-${idx}`,
          values: {
            title: `edX Demo Course ${idx}`,
            userEmail: 'edx@example.com',
          },
        }))} // 8 selected courses exceeds max allowed
      />,
    );
    expect(screen.getByText(WARNING_ALERT_TITLE_TEXT)).toBeInTheDocument();
    const alertDismissBtn = screen.getByRole('button', { name: 'Dismiss' });
    expect(alertDismissBtn).toBeInTheDocument();
    userEvent.click(alertDismissBtn);
    await waitFor(() => {
      expect(screen.queryByText(WARNING_ALERT_TITLE_TEXT)).not.toBeInTheDocument();
    });
  });
});
