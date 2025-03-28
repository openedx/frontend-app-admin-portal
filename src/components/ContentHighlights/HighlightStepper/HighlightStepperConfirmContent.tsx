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
  Alert,
  Skeleton,
} from '@openedx/paragon';
import { Assignment } from '@openedx/paragon/icons';
import { camelCaseObject } from '@edx/frontend-platform';
import { Configure, InstantSearch, connectStateResults } from 'react-instantsearch-dom';
import { connect } from 'react-redux';
import { configuration } from '../../../config';
import {
  STEPPER_STEP_TEXT,
  MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET,
  HIGHLIGHTS_CARD_GRID_COLUMN_SIZES,
  DEFAULT_ERROR_MESSAGE,
  ENABLE_TESTING,
} from '../data/constants';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import ContentConfirmContentCard from './ContentConfirmContentCard';
import SkeletonContentCardContainer from '../SkeletonContentCardContainer';
import { SearchUnavailableAlert } from '../../algolia-search';

export const BaseReviewContentSelections = ({
  searchResults,
  isSearchStalled,
  currentSelectedRowIds,
}) => {
  if (isSearchStalled) {
    return (
      <SkeletonContentCardContainer itemCount={MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET} />
    );
  }
  if (!searchResults) {
    return <div data-testid="base-content-no-results" />;
  }
  const { hits } = camelCaseObject(searchResults);
  // ensures content is persisted in the order it was selected from the previous step.
  const sortedHits = hits.sort(
    (a, b) => currentSelectedRowIds.indexOf(a.aggregationKey) - currentSelectedRowIds.indexOf(b.aggregationKey),
  );

  return (
    <CardGrid columnSizes={HIGHLIGHTS_CARD_GRID_COLUMN_SIZES}>
      {sortedHits.map((original) => (
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
  currentSelectedRowIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

BaseReviewContentSelections.defaultProps = {
  searchResults: null,
};

const ReviewContentSelections = connectStateResults(BaseReviewContentSelections);

export const SelectedContent = ({ enterpriseId }) => {
  const searchClient = useContextSelector(
    ContentHighlightsContext,
    v => v[0].algolia.searchClient,
  );
  const hasSecuredAlgoliaApiKey = useContextSelector(
    ContentHighlightsContext,
    v => !!v[0].algolia.securedAlgoliaApiKey,
  );
  const isLoadingSecuredAlgoliaApiKey = useContextSelector(
    ContentHighlightsContext,
    v => !!v[0].algolia.isLoading,
  );
  const currentSelectedRowIdsRaw = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.currentSelectedRowIds,
  );

  const currentSelectedRowIds = Object.keys(currentSelectedRowIdsRaw);

  /* eslint-disable max-len */
  /**
   * Results in a string like::
   *
   *   Secured Algolia API key (filters by catalog query uuids):
   *     `(aggregation_key:'course:edX+DemoX' OR aggregation_key:'course:edX+DemoX2')`
   *
   *   Legacy:
   *     `enterprise_customer_uuids:e783bb19-277f-479e-9c41-8b0ed31b4060 AND (aggregation_key:'course:edX+DemoX' OR aggregation_key:'course:edX+DemoX2')
   */
  /* eslint-enable max-len */
  const algoliaFilters = useMemo(() => {
    if (isLoadingSecuredAlgoliaApiKey) {
      // Don't show any results until the secured API key is loaded (if enabled)
      return '';
    }
    let filterString = '';
    if (!hasSecuredAlgoliaApiKey) {
      // import testEnterpriseId from the existing ../data/constants folder and replace with
      // enterpriseId to test locally
      filterString += `enterprise_customer_uuids:${ENABLE_TESTING(enterpriseId)}`;
    }
    if (currentSelectedRowIds.length > 0) {
      if (filterString) {
        filterString += ' AND ';
      }
      filterString += '(';
      currentSelectedRowIds.forEach((selectedRowId, index) => {
        if (index !== 0) {
          filterString += ' OR ';
        }
        filterString += `aggregation_key:'${selectedRowId}'`;
      });
      filterString += ')';
    }
    return filterString;
  }, [currentSelectedRowIds, enterpriseId, hasSecuredAlgoliaApiKey, isLoadingSecuredAlgoliaApiKey]);

  if (currentSelectedRowIds.length === 0) {
    return (
      <Alert data-testid="selected-content-no-results" variant="warning">
        {DEFAULT_ERROR_MESSAGE.EMPTY_SELECTEDROWIDS}
      </Alert>
    );
  }

  if (isLoadingSecuredAlgoliaApiKey) {
    return (
      <>
        <Skeleton height={360} />
        <div className="sr-only">Loading selected content...</div>
      </>
    );
  }

  if (!searchClient) {
    return (
      <SearchUnavailableAlert className="mt-4" />
    );
  }

  return (
    <InstantSearch
      indexName={configuration.ALGOLIA.INDEX_NAME!}
      searchClient={searchClient}
    >
      <Configure
        filters={algoliaFilters}
        hitsPerPage={MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET}
      />
      <ReviewContentSelections currentSelectedRowIds={currentSelectedRowIds} />
    </InstantSearch>
  );
};

SelectedContent.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const HighlightStepperConfirmContent = ({ enterpriseId }) => {
  const highlightTitle = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.highlightTitle,
  );

  return (
    <Container>
      <Row>
        <Col xs={12} md={8} lg={6}>
          <h3 className="mb-3 d-flex align-items-center">
            <Icon src={Assignment} className="mr-2 text-brand" />
            {STEPPER_STEP_TEXT.HEADER_TEXT.confirmContent}
          </h3>
          <p>
            {STEPPER_STEP_TEXT.SUB_TEXT.confirmContent(highlightTitle)}.
          </p>
        </Col>
      </Row>
      <SelectedContent enterpriseId={enterpriseId} />
    </Container>
  );
};

HighlightStepperConfirmContent.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(HighlightStepperConfirmContent);
