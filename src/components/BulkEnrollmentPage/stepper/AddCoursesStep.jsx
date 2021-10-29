import React from 'react';
import PropTypes from 'prop-types';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, Configure } from 'react-instantsearch-dom';
import { SearchData, SearchHeader } from '@edx/frontend-enterprise-catalog-search';
import DismissibleCourseWarning from './DismissibleCourseWarning';

import { configuration } from '../../../config';
import { ADD_COURSES_TITLE, ADD_COURSE_DESCRIPTION } from './constants';

import CourseSearchResults from '../CourseSearchResults';

const currentEpoch = Math.round((new Date()).getTime() / 1000);
const maxCourses = 1;

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const AddCoursesStep = ({
  enterpriseId, enterpriseSlug, subscription, selectedCoursesNum,
}) => (
  <>
    <p>{ADD_COURSE_DESCRIPTION}</p>
    <h2>{ADD_COURSES_TITLE}</h2>
    {selectedCoursesNum >= maxCourses ? <DismissibleCourseWarning /> : null}
    <SearchData>
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME}
        searchClient={searchClient}
      >
        <Configure
          filters={`enterprise_catalog_uuids:${subscription.enterpriseCatalogUuid} AND advertised_course_run.upgrade_deadline>${currentEpoch}`}
          hitsPerPage={25}
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

AddCoursesStep.defaultProps = {
  selectedCoursesNum: null,
};

AddCoursesStep.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    enterpriseCatalogUuid: PropTypes.string.isRequired,
  }).isRequired,
  selectedCoursesNum: PropTypes.number,
};

export default AddCoursesStep;
