import React from 'react';
import { Provider } from 'react-redux';
import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import {
  SEARCH_FACET_FILTERS,
  SearchContext,
} from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import algoliasearch from 'algoliasearch/lite';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { queryClient, renderWithRouter } from '../../../test/testUtils';
import CatalogSearch from '../CatalogSearch';
import { useBudgetId, useEnterpriseGroup, useSubsidyAccessPolicy } from '../../data';
import { UseAlgoliaSearchResult } from '../../../algolia-search';

jest.mock('react-instantsearch-dom', () => ({
  ...jest.requireActual('react-instantsearch-dom'),
  InstantSearch: () => <div>SEARCH</div>,
  Index: () => <div>SEARCH</div>,
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('../../data');

const DEFAULT_SEARCH_CONTEXT_VALUE = { refinements: {} };

const mockStore = configureMockStore();

const mockCatalogUuid = 'mock-catalog-uuid';
const mockEnterpriseCatalogQueryUuid = 'mock-catalog-query-uuid';

const defaultMockStoreState = {
  portalConfiguration: {
    enterpriseId: 'enterprise-id',
    enterpriseFeatures: {},
  },
};

const defaultAlgoliaProps: UseAlgoliaSearchResult = {
  catalogUuidsToCatalogQueryUuids: null,
  isLoading: false,
  isCatalogQueryFiltersEnabled: false,
  searchClient: null,
  securedAlgoliaApiKey: null,
};

const searchClient = algoliasearch('appId', 'test-api-key');

const SearchDataWrapper = ({
  children,
  searchContextValue,
  store = defaultMockStoreState,
}) => (
  <QueryClientProvider client={queryClient()}>
    <Provider store={mockStore(store)}>
      <IntlProvider locale="en">
        <SearchContext.Provider
          value={searchContextValue}
          searchFacetFilters={[
            ...SEARCH_FACET_FILTERS,
          ]}
        >
          {children}
        </SearchContext.Provider>
      </IntlProvider>
    </Provider>
  </QueryClientProvider>
);

describe('Catalog Search component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAuthenticatedUser.mockReturnValue({
      userId: 3,
    });
    (useBudgetId as jest.Mock).mockReturnValue({
      subsidyAccessPolicyId: 'test-id',
    });
    (useSubsidyAccessPolicy as jest.Mock).mockReturnValue({
      data: {
        catalogUuid: mockCatalogUuid,
      },
    });
    (useEnterpriseGroup as jest.Mock).mockReturnValue({
      data: {
        appliesToAllContexts: true,
      },
    });
  });

  it('renders loading state', () => {
    const loadingAlgoliaProps = {
      ...defaultAlgoliaProps,
      isCatalogQueryFiltersEnabled: true,
      isLoading: true,
    };
    renderWithRouter(
      <SearchDataWrapper searchContextValue={DEFAULT_SEARCH_CONTEXT_VALUE}>
        <CatalogSearch algolia={loadingAlgoliaProps} />
      </SearchDataWrapper>,
    );
    expect(screen.getByTestId('catalog-search-loading')).toBeInTheDocument();
  });

  it('displays search unavailable error without searchClient', () => {
    renderWithRouter(
      <SearchDataWrapper searchContextValue={DEFAULT_SEARCH_CONTEXT_VALUE}>
        <CatalogSearch algolia={defaultAlgoliaProps} />
      </SearchDataWrapper>,
    );
    expect(screen.getByText('search functionality is currently unavailable', { exact: false })).toBeInTheDocument();
  });

  it.each([
    { usesCatalogQuerySearchFilters: false },
    { usesCatalogQuerySearchFilters: true },
  ])('renders search component with searchClient (%s)', ({ usesCatalogQuerySearchFilters }) => {
    const algolia: UseAlgoliaSearchResult = {
      ...defaultAlgoliaProps,
      isCatalogQueryFiltersEnabled: usesCatalogQuerySearchFilters,
      catalogUuidsToCatalogQueryUuids: usesCatalogQuerySearchFilters
        ? { [mockCatalogUuid]: mockEnterpriseCatalogQueryUuid }
        : null,
      searchClient,
    };
    renderWithRouter(
      <SearchDataWrapper searchContextValue={DEFAULT_SEARCH_CONTEXT_VALUE}>
        <CatalogSearch algolia={algolia} />
      </SearchDataWrapper>,
    );
    expect(screen.getByText('SEARCH')).toBeInTheDocument();
  });
});
