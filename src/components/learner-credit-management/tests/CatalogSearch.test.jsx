import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  SEARCH_FACET_FILTERS,
  SearchContext,
} from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test/testUtils';
import CatalogSearch from '../search/CatalogSearch';

jest.mock('react-instantsearch-dom', () => ({
  ...jest.requireActual('react-instantsearch-dom'),
  InstantSearch: () => <div>SEARCH</div>,
  Index: () => <div>SEARCH</div>,
}));

const DEFAULT_SEARCH_CONTEXT_VALUE = { refinements: {} };

// eslint-disable-next-line react/prop-types
const SearchDataWrapper = ({ children, searchContextValue }) => (
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
);

describe('Catalog Search component', () => {
  it('properly renders component', () => {
    renderWithRouter(
      <SearchDataWrapper searchContextValue={DEFAULT_SEARCH_CONTEXT_VALUE}>
        <CatalogSearch />
      </SearchDataWrapper>,
    );
    expect(screen.getByText('SEARCH')).toBeInTheDocument();
  });
});
