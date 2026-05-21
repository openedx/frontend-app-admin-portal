import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
import { Configure, connectStateResults, InstantSearch } from 'react-instantsearch-dom';
import { CardView, DataTable, Skeleton } from '@openedx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { SearchData, SearchHeader } from '@2uinc/frontend-enterprise-catalog-search';
import { connect } from 'react-redux';

import { configuration } from '../../../config';
import { ENABLE_TESTING, FOOTER_TEXT_BY_CONTENT_TYPE, MAX_PAGE_SIZE } from '../data/constants';
import ContentSearchResultCard from './ContentSearchResultCard';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import SelectContentSelectionStatus from './SelectContentSelectionStatus';
import SelectContentSelectionCheckbox from './SelectContentSelectionCheckbox';
import SkeletonContentCard from '../SkeletonContentCard';
import { useContentHighlightsContext } from '../data/hooks';
import { SearchUnavailableAlert } from '../../algolia-search';
import SelectContentSearchPagination from './SelectContentSearchPagination';

const defaultActiveStateValue = 'card';

const selectColumn = {
  id: 'selection',
  Header: () => null,
  Cell: SelectContentSelectionCheckbox,
  disableSortBy: true,
};

const PriceTableCell = ({ row }) => {
  const contentPrice = row.original.firstEnrollablePaidSeatPrice;
  if (!contentPrice) {
    return null;
  }
  return `$${contentPrice}`;
};

PriceTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      firstEnrollablePaidSeatPrice: PropTypes.number,
    }).isRequired,
  }).isRequired,
};

const ContentTypeTableCell = ({ row }) => FOOTER_TEXT_BY_CONTENT_TYPE[row.original.contentType.toLowerCase()];

const BaseHighlightStepperSelectContentDataTable = ({
  selectedRowIds,
  onSelectedRowsChanged,
  isSearchStalled,
  searchResults,
}) => {
  const intl = useIntl();
  const [currentView, setCurrentView] = useState(defaultActiveStateValue);
  const tableData = useMemo(() => camelCaseObject(searchResults?.hits || []), [searchResults]);
  const searchResultsItemCount = searchResults?.nbHits || 0;
  const searchResultsPageCount = searchResults?.nbPages || 0;
  return (
    <DataTable
      isLoading={isSearchStalled}
      onSelectedRowsChanged={onSelectedRowsChanged}
      dataViewToggleOptions={{
        isDataViewToggleEnabled: true,
        onDataViewToggle: val => setCurrentView(val),
        defaultActiveStateValue,
        togglePlacement: 'left',
      }}
      isSelectable
      isPaginated
      manualPagination
      initialState={{
        pageIndex: 0,
        pageSize: MAX_PAGE_SIZE,
        selectedRowIds,
      }}
      pageCount={searchResultsPageCount}
      itemCount={searchResultsItemCount}
      initialTableOptions={{
        getRowId: row => row?.aggregationKey,
        autoResetSelectedRows: false,
      }}
      data={tableData}
      manualSelectColumn={selectColumn}
      SelectionStatusComponent={SelectContentSelectionStatus}
      columns={[
        {
          Header: intl.formatMessage({
            id: 'highlights.new.highlights.stepper.select.content.table.header.content.name',
            defaultMessage: 'Content name',
            description: 'Table header for content title in highlight content selection step',
          }),
          accessor: 'title',
        },
        {
          Header: intl.formatMessage({
            id: 'highlights.new.highlights.stepper.select.content.table.header.partner',
            defaultMessage: 'Partner',
            description: 'Table header for partner in highlight content selection step',
          }),
          accessor: 'partners[0].name',
        },
        {
          Header: intl.formatMessage({
            id: 'highlights.new.highlights.stepper.select.content.table.header.content.type',
            defaultMessage: 'Content type',
            description: 'Table header for content type in highlight content selection step',
          }),
          Cell: ContentTypeTableCell,
        },
        {
          Header: intl.formatMessage({
            id: 'highlights.new.highlights.stepper.select.content.table.header.price',
            defaultMessage: 'Price',
            description: 'Table header for price in highlight content selection step',
          }),
          Cell: PriceTableCell,
        },
      ]}
    >
      <DataTable.TableControlBar />
      {currentView === 'card' && (
        <CardView
          columnSizes={{
            xs: 12,
            md: 6,
            lg: 4,
            xl: 3,
          }}
          SkeletonCardComponent={SkeletonContentCard}
          CardComponent={ContentSearchResultCard}
        />
      )}
      {currentView === 'list' && <DataTable.Table /> }
      <DataTable.EmptyTable content={intl.formatMessage({
        id: 'highlights.new.highlights.stepper.select.content.table.empty.results',
        defaultMessage: 'No results found',
        description: 'Empty state text shown when content search returns no results',
      })}
      />
      <DataTable.TableFooter>
        <SelectContentSearchPagination />
      </DataTable.TableFooter>
    </DataTable>
  );
};

BaseHighlightStepperSelectContentDataTable.propTypes = {
  selectedRowIds: PropTypes.shape({}).isRequired,
  onSelectedRowsChanged: PropTypes.func.isRequired,
  isSearchStalled: PropTypes.bool.isRequired,
  searchResults: PropTypes.shape({
    hits: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    nbHits: PropTypes.number.isRequired,
    nbPages: PropTypes.number.isRequired,
  }),
};

BaseHighlightStepperSelectContentDataTable.defaultProps = {
  searchResults: null,
};

const HighlightStepperSelectContentDataTable = connectStateResults(BaseHighlightStepperSelectContentDataTable);

type HighlightStepperSelectContentProps = {
  enterpriseId: string;
};

const HighlightStepperSelectContent: React.FC<HighlightStepperSelectContentProps> = ({ enterpriseId }) => {
  const intl = useIntl();
  const { setCurrentSelectedRowIds } = useContentHighlightsContext();
  const currentSelectedRowIds = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.currentSelectedRowIds,
  );
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
    v => v[0].algolia.isLoading,
  );
  const isEditMode = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.isEditMode,
  );
  const existingContentKeys = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.existingContentKeys,
  );

  // In edit mode, boost existing content to appear first in results
  const optionalFilters = useMemo(() => {
    if (!isEditMode || !existingContentKeys || existingContentKeys.length === 0) {
      return undefined;
    }
    // Algolia optionalFilters boost matching records to the top without excluding others
    return existingContentKeys.map(key => `aggregation_key:${key}`);
  }, [isEditMode, existingContentKeys]);

  if (isLoadingSecuredAlgoliaApiKey) {
    return (
      <>
        <Skeleton height={360} />
        <div className="sr-only">Loading courses...</div>
      </>
    );
  }

  if (!searchClient) {
    return (
      <SearchUnavailableAlert className="mt-4" />
    );
  }

  // FIXME: Remove 'NOT content_type:video' when video content metadata updated to
  // to identical data-structure as similar algolia search objects, ex. COURSES
  const baseSearchFilters = 'NOT content_type:video';
  let searchFilters;
  if (hasSecuredAlgoliaApiKey) {
    searchFilters = baseSearchFilters;
  } else {
    searchFilters = `enterprise_customer_uuids:${ENABLE_TESTING(enterpriseId)} AND (${baseSearchFilters})`;
  }

  return (
    <SearchData>
      <InstantSearch
        indexName={configuration.ALGOLIA.INDEX_NAME!}
        searchClient={searchClient}
      >
        <Configure
          filters={searchFilters}
          hitsPerPage={MAX_PAGE_SIZE}
          {...(optionalFilters ? { optionalFilters } : {})}
        />
        <SearchHeader
          variant="default"
          headerTitle={intl.formatMessage({
            id: 'highlights.new.highlights.stepper.search.courses.label',
            defaultMessage: 'Search courses',
            description: 'Search input label in highlight content selection step',
          })}
        />
        <HighlightStepperSelectContentDataTable
          selectedRowIds={currentSelectedRowIds}
          onSelectedRowsChanged={setCurrentSelectedRowIds}
        />
      </InstantSearch>
    </SearchData>
  );
};

HighlightStepperSelectContent.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(HighlightStepperSelectContent);
