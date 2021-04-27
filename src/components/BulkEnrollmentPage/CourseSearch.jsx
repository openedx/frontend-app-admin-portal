import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router';

import { InstantSearch, Configure } from 'react-instantsearch-dom';
import { SearchHeader, SearchData } from '@edx/frontend-enterprise';
import Skeleton from 'react-loading-skeleton';

import CourseSearchResults from './CourseSearchResults';
import { configuration } from '../../config';
import { useSubscriptionFromParams } from '../subscriptions/data/contextHooks';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

export const NO_DATA_MESSAGE = 'There are no results';

export const BaseCourseSearch = ({
  enterpriseId, enterpriseSlug, enterpriseName, match,
}) => {
  const PAGE_TITLE = `Search courses - ${enterpriseName}`;
  const [subscription, isLoadingSubscription] = useSubscriptionFromParams({ match });
  if (!subscription && !isLoadingSubscription) {
    return (
      <Redirect to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.bulkEnrollment}/`} />
    );
  }
  if (isLoadingSubscription) {
    return (
      <div data-testid="skelly">
        <div className="sr-only">Loading...</div>
        <Skeleton height={175} />
        <Skeleton className="mt-3" height={50} count={25} />
      </div>
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

BaseCourseSearch.defaultProps = {
  enterpriseId: '',
  enterpriseSlug: '',
  enterpriseName: '',
};

BaseCourseSearch.propTypes = {
  // from redux store
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

export default connect(mapStateToProps)(BaseCourseSearch);
