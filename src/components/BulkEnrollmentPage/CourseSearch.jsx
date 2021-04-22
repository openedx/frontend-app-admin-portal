import React from 'react';

import algoliasearch from 'algoliasearch/lite';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { InstantSearch, Configure } from 'react-instantsearch-dom';
import { SearchHeader, SearchData } from '@edx/frontend-enterprise';
import CourseSearchResults from './CourseSearchResults';
import { configuration } from '../../config';
import { useSubscriptionFromParams } from '../subscriptions/data/contextHooks';
import { NotFound } from '../NotFoundPage';

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

export const NO_DATA_MESSAGE = 'There are no results';

const CourseSearch = ({
  enterpriseId, enterpriseSlug, enterpriseName, match,
}) => {
  const PAGE_TITLE = `Search courses - ${enterpriseName}`;
  const subscription = useSubscriptionFromParams({ match });
  if (!subscription) {
    return (
      <NotFound />
    );
  }

  return (
    <SearchData>
      <Helmet title={PAGE_TITLE} />
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME}
        searchClient={searchClient}
      >
        <Configure
          filters={`enterprise_catalog_uuids:${subscription.enterpriseCatalogUuid}`}
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
  enterpriseName: '',
};

CourseSearch.propTypes = {
  // from redux-store
  enterpriseId: PropTypes.string,
  enterpriseSlug: PropTypes.string,
  enterpriseName: PropTypes.string,
  // from react-router
  match: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseName: state.portalConfiguration.enterpriseName,
});

export default connect(mapStateToProps)(CourseSearch);
