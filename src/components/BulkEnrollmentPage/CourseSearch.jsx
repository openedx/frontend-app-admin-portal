import React from 'react';

import algoliasearch from 'algoliasearch/lite';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { InstantSearch, Configure } from 'react-instantsearch-dom';
import { SearchHeader, SearchData } from '@edx/frontend-enterprise';
import CourseSearchResults from './CourseSearchResults';
import { configuration } from '../../config';

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

export const NO_DATA_MESSAGE = 'There are no results';

const CourseSearch = ({ enterpriseId, enterpriseSlug, match }) => {
  const PAGE_TITLE = `Search courses - ${enterpriseId}`;
  const { params: { subscriptionCatalogUuid } } = match;

  return (
    <SearchData>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME}
        searchClient={searchClient}
      >
        <Configure
          filters={`enterprise_catalog_uuids:${subscriptionCatalogUuid}`}
          hitsPerPage={25}
        />
        <SearchHeader />
        <CourseSearchResults
          enterpriseId={enterpriseId}
          enterpriseSlug={enterpriseSlug}
        />
      </InstantSearch>
    </SearchData>
  );
};

CourseSearch.defaultProps = {
  enterpriseId: '',
  enterpriseSlug: '',
};

CourseSearch.propTypes = {
  // from redux-store
  enterpriseId: PropTypes.string,
  enterpriseSlug: PropTypes.string,
  // from react-router
  match: PropTypes.shape({
    params: PropTypes.shape({
      subscriptionCatalogUuid: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(CourseSearch);
