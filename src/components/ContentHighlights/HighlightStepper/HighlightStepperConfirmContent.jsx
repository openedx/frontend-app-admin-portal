import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
import algoliasearch from 'algoliasearch/lite';
import {
  Container,
  Row,
  Col,
  Icon,
  CardGrid,
} from '@edx/paragon';
import { Assignment } from '@edx/paragon/icons';
import { camelCaseObject } from '@edx/frontend-platform';
import { Configure, InstantSearch, connectStateResults } from 'react-instantsearch-dom';

import { configuration } from '../../../config';
import { STEPPER_STEP_TEXT, MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET } from '../data/constants';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import SkeletonContentCard from '../SkeletonContentCard';

const prodEnterpriseId = 'e783bb19-277f-479e-9c41-8b0ed31b4060';

const BaseReviewContentSelections = ({
  searchResults,
  isSearchStalled,
}) => {
  if (isSearchStalled) {
    return (
      <CardGrid
        columnSizes={{
          xs: 12,
          md: 6,
          lg: 4,
          xl: 3,
        }}
      >
        {[...new Array(8)].map(() => <SkeletonContentCard />)}
      </CardGrid>
    );
  }

  if (!searchResults) {
    return null;
  }

  const { hits } = camelCaseObject(searchResults);

  return (
    <ul>
      {hits.map((highlightedContent) => {
        const { aggregationKey, title } = highlightedContent;
        return (
          <li key={aggregationKey}>
            {title}
          </li>
        );
      })}
    </ul>
  );
};

BaseReviewContentSelections.propTypes = {
  searchResults: PropTypes.shape({
    hits: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      aggregationKey: PropTypes.string,
    })).isRequired,
  }),
  isSearchStalled: PropTypes.bool.isRequired,
};

BaseReviewContentSelections.defaultProps = {
  searchResults: null,
};

const ReviewContentSelections = connectStateResults(BaseReviewContentSelections);

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const SelectedContent = () => {
  const currentSelectedRowIdsRaw = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.currentSelectedRowIds,
  );
  const currentSelectedRowIds = Object.keys(currentSelectedRowIdsRaw);

  /* eslint-disable max-len */
  /**
   * Results in a string like:
   * `enterprise_customer_uuids:e783bb19-277f-479e-9c41-8b0ed31b4060 AND (aggregation_key:'course:edX+DemoX' OR aggregation_key:'course:edX+DemoX2')
   */
  /* eslint-enable max-len */
  const algoliaFilters = useMemo(() => {
    let filterString = `enterprise_customer_uuids:${prodEnterpriseId}`;
    if (currentSelectedRowIds.length > 0) {
      filterString += ' AND (';
      currentSelectedRowIds.forEach((selectedRowId, index) => {
        if (index !== 0) {
          filterString += ' OR ';
        }
        filterString += `aggregation_key:'${selectedRowId}'`;
      });
      filterString += ')';
    }
    return filterString;
  }, [currentSelectedRowIds]);

  if (currentSelectedRowIds.length === 0) {
    return null;
  }

  return (
    <InstantSearch
      indexName={configuration.ALGOLIA.INDEX_NAME}
      searchClient={searchClient}
    >
      <Configure
        filters={algoliaFilters}
        hitsPerPage={MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET}
      />
      <ReviewContentSelections />
    </InstantSearch>
  );
};

const HighlightStepperConfirmContent = () => (
  <Container>
    <Row>
      <Col xs={12} md={8} lg={6}>
        <h3 className="mb-3 d-flex align-items-center">
          <Icon src={Assignment} className="mr-2 color-brand-tertiary" />
          {STEPPER_STEP_TEXT.confirmContent}
        </h3>
      </Col>
    </Row>
    <SelectedContent />
  </Container>
);

export default HighlightStepperConfirmContent;
