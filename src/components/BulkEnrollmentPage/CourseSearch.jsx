import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import algoliasearch from 'algoliasearch/lite';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { InstantSearch, Configure } from 'react-instantsearch-dom';
import CourseSearchResults from './CourseSearchResults';

import {
  searchStateToUrl, urlToSearchState, DEBOUNCE_TIME, createURL,
} from '../../algoliaUtils';
import { configuration } from '../../config';

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const CourseSearch = ({ enterpriseId }) => {
  const PAGE_TITLE = `Search courses - ${enterpriseId}`;
  const location = useLocation();
  const history = useHistory();

  const [searchState, setSearchState] = useState(urlToSearchState(location));
  const [debouncedSetState, setDebouncedSetState] = useState(null);
  const onSearchStateChange = updatedSearchState => {
    clearTimeout(debouncedSetState);
    setDebouncedSetState(
      setTimeout(() => {
        if (searchStateToUrl({ location, searchState: updatedSearchState })) {
          history.push(
            searchStateToUrl({ location, searchState: updatedSearchState }),
          );
        }
      }, DEBOUNCE_TIME),
    );

    setSearchState(updatedSearchState);
  };

  return (
    <div className="mt-4">
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME}
        searchClient={searchClient}
        searchState={searchState}
        onSearchStateChange={onSearchStateChange}
        createURL={createURL}
      >
        <Configure
          filters={`enterprise_customer_uuids:${enterpriseId}`}
          hitsPerPage={25}
        />
        <CourseSearchResults
          enterpriseId={enterpriseId}
          setSearchState={onSearchStateChange}
          searchState={searchState}
        />
      </InstantSearch>
    </div>
  );
};

CourseSearch.defaultProps = {
  enterpriseId: '',
};

CourseSearch.propTypes = {
  enterpriseId: PropTypes.string,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(CourseSearch);
