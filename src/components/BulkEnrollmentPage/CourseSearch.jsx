import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import qs from 'query-string';
import algoliasearch from 'algoliasearch/lite';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { InstantSearch, SearchBox, Configure } from 'react-instantsearch-dom';
import CourseSearchResults from './CourseSearchResults';

import { configuration } from '../../config';

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const DEBOUNCE_TIME = 400;
const createURL = state => `?${qs.stringify(state)}`;
const validateQuerystring = (queryObj) => {
  const validatedQueryObj = { ...queryObj };
  const { page } = queryObj;
  if (typeof page !== 'number' || page <= 1) {
    validatedQueryObj.page = 1;
  }
  return validatedQueryObj;
};

const searchStateToUrl = ({ location, searchState }) => (searchState ? `${location.pathname}${createURL(searchState)}` : '');

const urlToSearchState = ({ search }) => {
  const parsedSearch = qs.parse(search.slice(1));
  const validatedSearch = validateQuerystring(parsedSearch);
  return validatedSearch;
};

const CourseSearch = ({ enterpriseId }) => {
  const PAGE_TITLE = `Search courses - ${enterpriseId}`;
  const location = useLocation();
  const history = useHistory();
  console.log('url to search state', urlToSearchState(location));
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
  console.log('SEARCH STATE', searchState);

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME}
        searchClient={searchClient}
        searchState={searchState}
        onSearchStateChange={onSearchStateChange}
        createURL={createURL}
      >
        <Configure
          hitsPerPage={25}
        />
        <SearchBox />
        <CourseSearchResults setSearchState={onSearchStateChange} searchState={searchState} />
      </InstantSearch>
    </>
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
