import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch } from 'react-instantsearch-dom';
import { AppContext } from '@edx/frontend-platform/react';
import {
  SearchHeader,
  useDefaultSearchFilters,
} from '@edx/frontend-enterprise';

import { configuration } from '../../config/index';

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const CourseSearch = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { filters } = useDefaultSearchFilters({ enterpriseConfig });

  const PAGE_TITLE = `Search courses - ${enterpriseConfig.name}`;

  return (
    <React.Fragment>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME}
        searchClient={searchClient}
      >
        <Configure hitsPerPage={20} filters={filters} />
        <SearchHeader />
      </InstantSearch>
    </React.Fragment>
  );
};

export default CourseSearch;
