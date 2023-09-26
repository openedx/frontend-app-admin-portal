import React, {
  useContext, useState, useMemo, useEffect,
} from 'react';
import {
  FormattedMessage,
  injectIntl,
} from '@edx/frontend-platform/i18n';
import algoliasearch from 'algoliasearch/lite';

import { getConfig } from '@edx/frontend-platform/config';
import { Configure, Index, InstantSearch } from 'react-instantsearch-dom';
import {
  SearchHeader,
  SearchContext,
} from '@edx/frontend-enterprise-catalog-search';
import { configuration } from '../../../config';

import {
  CONTENT_TYPE_COURSE,
  CONTENT_TYPE_PROGRAM,
  EXEC_ED_TITLE,
  LEARNING_TYPE_REFINEMENT,
  NUM_RESULTS_COURSE,
  NUM_RESULTS_PROGRAM,
  NUM_RESULTS_PER_PAGE,
} from '../../../data/constants/learnerCredit';
import CatalogSearchResults from './CatalogSearchResults';

const CatalogSearch = () => {
  function convertLearningTypesToFilters(types) {
    return types.reduce((learningFacets, type) => {
      if (type === EXEC_ED_TITLE) {
        learningFacets.push(`"${type}"`);
      } else {
        learningFacets.push(type);
      }
      return learningFacets;
    }, []).join(' OR ');
  }

  const {
    refinements: {
      [LEARNING_TYPE_REFINEMENT]: learningType,
      enterprise_catalog_query_titles: enterpriseCatalogQueryTitles,
    },
  } = useContext(SearchContext);
  const searchClient = algoliasearch(configuration.ALGOLIA.APP_ID, configuration.ALGOLIA.SEARCH_API_KEY);
  const courseFilter = `${LEARNING_TYPE_REFINEMENT}:${CONTENT_TYPE_COURSE}`;
  const execEdFilter = `${LEARNING_TYPE_REFINEMENT}:"${EXEC_ED_TITLE}"`;
  const programFilter = `${LEARNING_TYPE_REFINEMENT}:${CONTENT_TYPE_PROGRAM}`;
  const [noCourseResults, setNoCourseResults] = useState(false);
  const [noProgramResults, setNoProgramResults] = useState(false);
  const [noExecEdResults, setNoExecEdResults] = useState(false);
  const [specifiedContentType, setSpecifiedContentType] = useState();
  const [
    suggestedSearchContentTypeFilter,
    setSuggestedSearchContentTypeFilter,
  ] = useState('');

  const [contentWithResults, setContentWithResults] = useState([]);
  const [contentWithoutResults, setContentWithoutResults] = useState([]);

  const contentData = useMemo(
    () => ({
      [CONTENT_TYPE_COURSE]: {
        filter: courseFilter,
        noResults: noCourseResults,
        setNoResults: setNoCourseResults,
        numResults: NUM_RESULTS_COURSE,
      },
      [EXEC_ED_TITLE]: {
        filter: execEdFilter,
        noResults: noExecEdResults,
        setNoResults: setNoExecEdResults,
        numResults: NUM_RESULTS_COURSE,
      },
      [CONTENT_TYPE_PROGRAM]: {
        filter: programFilter,
        noResults: noProgramResults,
        setNoResults: setNoProgramResults,
        numResults: NUM_RESULTS_PROGRAM,
      },
    }),
    [
      courseFilter,
      execEdFilter,
      programFilter,
      noCourseResults,
      noExecEdResults,
      noProgramResults,
    ],
  );

  useEffect(() => {
    contentData[CONTENT_TYPE_COURSE].noResults = noCourseResults;
    contentData[CONTENT_TYPE_PROGRAM].noResults = noProgramResults;
    contentData[EXEC_ED_TITLE].noResults = noExecEdResults;
  }, [noCourseResults, noProgramResults, noExecEdResults, contentData]);

  // set specified content types & suggested search content types
  useEffect(() => {
    if (learningType) {
      if (learningType.length === 1) {
        setSpecifiedContentType(learningType);
      }
      setSuggestedSearchContentTypeFilter(
        convertLearningTypesToFilters(learningType),
      );
    } else {
      setSpecifiedContentType(undefined);
      setSuggestedSearchContentTypeFilter(
        [
          CONTENT_TYPE_COURSE,
          CONTENT_TYPE_PROGRAM,
          `"${EXEC_ED_TITLE}"`,
        ]
          .map((item) => `${LEARNING_TYPE_REFINEMENT}:${item}`)
          .join(' OR '),
      );
    }
  }, [learningType, setSpecifiedContentType]);

  const config = getConfig();
  const courseIndex = useMemo(() => {
    const cIndex = searchClient.initIndex(config.ALGOLIA_INDEX_NAME);
    return cIndex;
  }, [config.ALGOLIA_INDEX_NAME, searchClient]);

  // Build out the list of content to display, ordering first by learning types that currently have results
  // and then by `course` > `exec ed` > `program`. Make sure to remove exec ed if the feature flag is disabled
  // or if the currently selected catalog isn't `a la carte`.
  useEffect(() => {
    const defaultTypes = [
      CONTENT_TYPE_COURSE,
      EXEC_ED_TITLE,
      CONTENT_TYPE_PROGRAM,
    ];
    // Grab content type(s) to use
    const contentToDisplay = learningType
      ? defaultTypes.filter((value) => learningType.includes(value))
      : defaultTypes;

    // Determine if we need to remove exec ed
    if (
      (enterpriseCatalogQueryTitles
        && !enterpriseCatalogQueryTitles.includes(
          config.EDX_ENTERPRISE_ALACARTE_TITLE,
        ))
    ) {
      if (contentToDisplay.indexOf(EXEC_ED_TITLE) > 0) {
        contentToDisplay.splice(
          contentToDisplay.indexOf(EXEC_ED_TITLE),
          1,
        );
      }
    }

    // rendering in order of what content we have search results for
    const resultList = contentToDisplay.filter(
      (obj) => !contentData[obj].noResults,
    );
    setContentWithResults(resultList);

    const noResultList = contentToDisplay.filter(
      (obj) => contentData[obj].noResults,
    );
    setContentWithoutResults(noResultList);
  }, [
    enterpriseCatalogQueryTitles,
    config,
    specifiedContentType,
    learningType,
    contentData,
    noCourseResults,
    noProgramResults,
    noExecEdResults,
  ]);

  // Take a list of learning types and render a search results component for each item
  const contentToRender = (items) => {
    const itemsWithResultsList = items.map((item) => (
      <Index
        indexName={configuration.ALGOLIA.INDEX_NAME}
        indexId={`search-${item}`}
        key={`search-${item}`}
      >
        <Configure
          hitsPerPage={
            specifiedContentType && learningType?.length === 1
              ? NUM_RESULTS_PER_PAGE
              : contentData[item].numResults
          }
          filters={contentData[item].filter}
          facetingAfterDistinct
        />
        <CatalogSearchResults
          preview={specifiedContentType === undefined}
          contentType={item}
          setNoContent={contentData[item].setNoResults}
        />
      </Index>
    ));
    return itemsWithResultsList;
  };

  const defaultInstantSearchFilter = `${LEARNING_TYPE_REFINEMENT}:${CONTENT_TYPE_COURSE} OR ${LEARNING_TYPE_REFINEMENT}:${CONTENT_TYPE_PROGRAM} OR ${LEARNING_TYPE_REFINEMENT}:"${EXEC_ED_TITLE}"`;

  return (
    <section>
      <FormattedMessage
        id="catalogs.enterpriseCatalogs.header"
        defaultMessage="Search courses and programs"
        description="Search dialogue."
        tagName="h2"
      />
      <InstantSearch indexName={configuration.ALGOLIA.INDEX_NAME} searchClient={searchClient}>
        <div className="enterprise-catalogs-header">
          <Configure
            filters={defaultInstantSearchFilter}
            facetingAfterDistinct
          />
          <SearchHeader
            hideTitle
            variant="default"
            index={courseIndex}
            filters={suggestedSearchContentTypeFilter}
            disableSuggestionRedirect
          />
        </div>
        <>
          {contentToRender([...contentWithResults, ...contentWithoutResults])}
        </>
      </InstantSearch>
    </section>
  );
};

export default injectIntl(CatalogSearch);
