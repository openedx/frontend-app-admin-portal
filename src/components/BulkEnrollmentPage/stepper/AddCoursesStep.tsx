import React, { useContext, useEffect } from 'react';
import { InstantSearch, Configure } from 'react-instantsearch-dom';
import { SearchData, SearchHeader } from '@edx/frontend-enterprise-catalog-search';
import { connect } from 'react-redux';
import { logError } from '@edx/frontend-platform/logging';
import { Skeleton } from '@openedx/paragon';

import DismissibleCourseWarning from './DismissibleCourseWarning';
import { configuration } from '../../../config';
import {
  ADD_COURSES_TITLE,
  ADD_COURSE_DESCRIPTION,
  NUM_CONTENT_ITEMS_PER_PAGE,
} from './constants';
import { BulkEnrollContext, Subscription } from '../BulkEnrollmentContext';

import CourseSearchResults from '../CourseSearchResults';
import { withAlgoliaSearch, type UseAlgoliaSearchResult } from '../../algolia-search';
import type { SelectedRow } from '../data/types';
import SearchUnavailableAlert from '../../algolia-search/SearchUnavailableAlert';

const currentEpoch = Math.round((new Date()).getTime() / 1000);
const MAX_COURSES = 7;

/**
 * Returns the filters to be used in the Algolia search.
 *
 * If the catalog query filters are enabled and we have the mappings of catalog<>query, the returned
 * filters use the catalog query UUIDs.
 *
 * Otherwise, the filters use the catalog UUIDs.
 *
 * In either case, the filters also include the upgrade deadline.
 */
function useAlgoliaFilters(subscription: Subscription, algolia: UseAlgoliaSearchResult) {
  let baseFilters = '';
  if (algolia.isCatalogQueryFiltersEnabled && algolia.catalogUuidsToCatalogQueryUuids) {
    baseFilters += `enterprise_catalog_query_uuids:${algolia.catalogUuidsToCatalogQueryUuids[subscription.enterpriseCatalogUuid]}`;
  } else {
    baseFilters += `enterprise_catalog_uuids:${subscription.enterpriseCatalogUuid}`;
  }
  baseFilters += ` AND advertised_course_run.upgrade_deadline>${currentEpoch}`;
  return baseFilters;
}

interface BaseAddCoursesStepContentsProps {
  children: React.ReactNode;
}

const BaseAddCoursesStepContents: React.FC<BaseAddCoursesStepContentsProps> = ({ children }) => (
  <>
    <p>{ADD_COURSE_DESCRIPTION}</p>
    <h2>{ADD_COURSES_TITLE}</h2>
    {children}
  </>
);

interface SearchEnabledProps {
  enterpriseId: string;
  enterpriseSlug: string;
  selectedCourses?: SelectedRow[];
  subscription: Subscription;
  algolia: UseAlgoliaSearchResult;
}

const BaseSearchEnabled: React.FC<SearchEnabledProps> = ({
  enterpriseId,
  enterpriseSlug,
  selectedCourses,
  subscription,
  algolia,
}) => {
  const algoliaFilters = useAlgoliaFilters(subscription, algolia);

  return (
    <>
      <DismissibleCourseWarning defaultShow={(selectedCourses?.length || 0) > MAX_COURSES} />
      <SearchData>
        <InstantSearch
          indexName={configuration.ALGOLIA.INDEX_NAME!}
          searchClient={algolia.searchClient}
        >
          <Configure
            filters={algoliaFilters}
            hitsPerPage={NUM_CONTENT_ITEMS_PER_PAGE}
          />
          <SearchHeader variant="default" />
          <CourseSearchResults
            enterpriseId={enterpriseId}
            enterpriseSlug={enterpriseSlug}
            subscriptionUUID={subscription.uuid}
          />
        </InstantSearch>
      </SearchData>
    </>
  );
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

const SearchEnabled = connect(mapStateToProps)(BaseSearchEnabled);

interface AddCoursesStepProps {
  subscription: Subscription;
  algolia: UseAlgoliaSearchResult;
}

export const AddCoursesStep: React.FC<AddCoursesStepProps> = ({
  subscription,
  algolia,
}) => {
  const {
    courses: [selectedCourses],
  } = useContext(BulkEnrollContext);

  const catalogQueryUuid = algolia.catalogUuidsToCatalogQueryUuids?.[subscription.enterpriseCatalogUuid];

  useEffect(() => {
    if (!algolia.isCatalogQueryFiltersEnabled || algolia.isLoading) {
      // Filtering Algolia by catalog query is not enabled or the
      // query is still loading; skipping.
      return;
    }

    if (!catalogQueryUuid) {
      // Log an error if the catalog query UUID is not found.
      const error = new Error(`No catalog query UUID found for the subscription ${subscription.uuid} and its catalog ${subscription.enterpriseCatalogUuid}`);
      logError(error);
    }
  }, [
    catalogQueryUuid,
    subscription.uuid,
    subscription.enterpriseCatalogUuid,
    algolia.isCatalogQueryFiltersEnabled,
    algolia.isLoading,
  ]);

  if (algolia.isCatalogQueryFiltersEnabled && algolia.isLoading) {
    return (
      <BaseAddCoursesStepContents>
        <Skeleton height={360} />
        <div data-testid="skeleton-algolia-loading-courses" className="sr-only">Loading courses...</div>
      </BaseAddCoursesStepContents>
    );
  }

  if (!algolia.searchClient) {
    return (
      <BaseAddCoursesStepContents>
        <SearchUnavailableAlert className="mt-4" />
      </BaseAddCoursesStepContents>
    );
  }

  return (
    <BaseAddCoursesStepContents>
      <SearchEnabled
        selectedCourses={selectedCourses}
        algolia={algolia}
        subscription={subscription}
      />
    </BaseAddCoursesStepContents>
  );
};

export default withAlgoliaSearch(AddCoursesStep);
