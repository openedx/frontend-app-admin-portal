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

const CourseSearch = ({ enterpriseId, enterpriseSlug }) => {
  const PAGE_TITLE = `Search courses - ${enterpriseId}`;

  return (
    <SearchData>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME}
        searchClient={searchClient}
      >
        <Configure
          filters={`enterprise_customer_uuids:${enterpriseId}`}
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
  enterpriseId: PropTypes.string,
  enterpriseSlug: PropTypes.string,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(CourseSearch);
