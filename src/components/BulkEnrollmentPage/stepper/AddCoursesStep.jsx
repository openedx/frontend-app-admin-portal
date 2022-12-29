import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, Configure } from 'react-instantsearch-dom';
import { SearchData, SearchHeader } from '@edx/frontend-enterprise-catalog-search';
import DismissibleCourseWarning from './DismissibleCourseWarning';

import { configuration } from '../../../config';
import {
  ADD_COURSES_TITLE,
  ADD_COURSE_DESCRIPTION,
  NUM_CONTENT_ITEMS_PER_PAGE,
} from './constants';
import { BulkEnrollContext } from '../BulkEnrollmentContext';

import CourseSearchResults from '../CourseSearchResults';

const currentEpoch = Math.round((new Date()).getTime() / 1000);
const MAX_COURSES = 7;

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const AddCoursesStep = ({
  enterpriseId, enterpriseSlug, subscription,
}) => {
  const { courses: [selectedCourses] } = useContext(BulkEnrollContext);
  return (
    <>
      <p>{ADD_COURSE_DESCRIPTION}</p>
      <h2>{ADD_COURSES_TITLE}</h2>
      {(selectedCourses?.length || 0) > MAX_COURSES ? <DismissibleCourseWarning /> : null}
      <SearchData>
        <InstantSearch
          indexName={configuration.ALGOLIA.INDEX_NAME}
          searchClient={searchClient}
        >
          <Configure
            filters={`enterprise_catalog_uuids:${subscription.enterpriseCatalogUuid} AND advertised_course_run.upgrade_deadline>${currentEpoch}`}
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

AddCoursesStep.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    enterpriseCatalogUuid: PropTypes.string.isRequired,
  }).isRequired,
};

export default AddCoursesStep;
