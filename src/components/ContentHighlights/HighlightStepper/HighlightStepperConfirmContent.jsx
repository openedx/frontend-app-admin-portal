import React, {
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
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

import {
  STEPPER_STEP_TEXT, MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET,
} from '../data/constants';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import SkeletonContentCard from '../SkeletonContentCard';
import ContentConfirmContentCard from './ContentConfirmContentCard';

export const BaseReviewContentSelections = ({
  searchResults,
  isSearchStalled,
}) => {
  if (isSearchStalled) {
    return (
      <div data-testid="skeleton-container">
        <CardGrid
          columnSizes={{
            xs: 12,
            md: 6,
            lg: 4,
            xl: 3,
          }}
        >
          {/* eslint-disable */}
        {[...new Array(8)].map((element, index) => 
        <SkeletonContentCard key={index} />)}
        {/* eslint-enable */}
        </CardGrid>
      </div>
    );
  }
  if (!searchResults) {
    return (<div data-testid="base-content-no-results" />);
  }
  const { hits } = camelCaseObject(searchResults);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const transformedCardData = hits.map((highlightedContent) => {
    const {
      aggregationKey, title, cardImageUrl, contentType, partners, originalImageUrl, firstEnrollablePaidSeatPrice,
    } = highlightedContent;
    const original = {
      aggregationKey,
      title,
      contentType,
      partners,
      cardImageUrl,
      originalImageUrl,
      firstEnrollablePaidSeatPrice,
    };
    return original;
  });
  return (
    <CardGrid
      columnSizes={{
        xs: 12,
        md: 6,
        lg: 4,
        xl: 3,
      }}
    >
      {transformedCardData.map((original) => (
        <ContentConfirmContentCard key={original.aggregationKey} original={original} />))}
    </CardGrid>
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

export const SelectedContent = ({ enterpriseId }) => {
  const searchClient = useContextSelector(
    ContentHighlightsContext,
    v => v[0].searchClient,
  );
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
    // TODO: replace testEnterpriseId with enterpriseID before push,
    // uncomment out import and replace with testEnterpriseId to test
    let filterString = `enterprise_customer_uuids:${enterpriseId}`;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSelectedRowIds]);

  if (currentSelectedRowIds.length === 0) {
    return (<div data-testid="selected-content-no-results" />);
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

SelectedContent.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const HighlightStepperConfirmContent = ({ enterpriseId }) => (
  <Container>
    <Row>
      <Col xs={12} md={8} lg={6}>
        <h3 className="mb-3 d-flex align-items-center">
          <Icon src={Assignment} className="mr-2 color-brand-tertiary" />
          {STEPPER_STEP_TEXT.confirmContent}
        </h3>
      </Col>
    </Row>
    <SelectedContent enterpriseId={enterpriseId} />
  </Container>
);

HighlightStepperConfirmContent.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default HighlightStepperConfirmContent;
