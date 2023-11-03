import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  SEARCH_FACET_FILTERS,
  SearchContext,
} from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, renderWithRouter } from '../../test/testUtils';
import CatalogSearch from '../search/CatalogSearch';

import { useBudgetId, useSubsidyAccessPolicy } from '../data';

jest.mock('react-instantsearch-dom', () => ({
  ...jest.requireActual('react-instantsearch-dom'),
  InstantSearch: () => <div>SEARCH</div>,
  Index: () => <div>SEARCH</div>,
}));

jest.mock('../data');

const DEFAULT_SEARCH_CONTEXT_VALUE = { refinements: {} };

const SearchDataWrapper = ({ children, searchContextValue }) => (
  <QueryClientProvider client={queryClient()}>
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
  </QueryClientProvider>
);

describe('Catalog Search component', () => {
  it('properly renders component', () => {
    useBudgetId.mockReturnValue({
      subsidyAccessPolicyId: 'test-id',
    });
    useSubsidyAccessPolicy.mockReturnValue({
      data: {
        catalogUuid: '123',
      },
    });
    renderWithRouter(
      <SearchDataWrapper searchContextValue={DEFAULT_SEARCH_CONTEXT_VALUE}>
        <CatalogSearch />
      </SearchDataWrapper>,
    );
    expect(screen.getByText('SEARCH')).toBeInTheDocument();
  });
});
