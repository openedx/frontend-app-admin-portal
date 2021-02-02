import React, { useContext, useEffect } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { InstantSearch, SearchBox } from 'react-instantsearch-dom';
import CourseSearchResults from './CourseSearchResults';
import { QueryContext } from '../../containers/QueryProvider';

import { configuration } from '../../config';

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const CourseSearch = ({ enterpriseId }) => {
  const PAGE_TITLE = `Search courses - ${enterpriseId}`;

  const { currentQuery, setQueries, setPrefix } = useContext(QueryContext);
  // setPrefix('be');
  console.log(currentQuery);

  useEffect(() => setPrefix('be'), []);
  return (
    <>
      <button onClick={() => {setQueries({
    page: 3,
    bar: 'twenty'
  })}} >CLICK ME</button>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME}
        searchClient={searchClient}
      >
        <SearchBox />
        <CourseSearchResults />
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
