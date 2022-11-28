import React, {
  useState, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
import algoliasearch from 'algoliasearch/lite';
import { Configure, InstantSearch, connectStateResults } from 'react-instantsearch-dom';
import { DataTable, CardView } from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';

import { configuration } from '../../../config';
import { FOOTER_TEXT_BY_CONTENT_TYPE } from '../data/constants';
import ContentHighlightCardItem from '../ContentHighlightCardItem';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import SelectCoursesSelectionStatus from './SelectCoursesSelectionStatus';
import SelectCoursesSelectCheckbox from './SelectCoursesSelectCheckbox';
import SelectCoursesSearchPagination from './SelectCoursesSearchPagination';
import SkeletonContentCard from '../SkeletonContentCard';

const defaultActiveStateValue = 'card';
const pageSize = 24;

const selectColumn = {
  id: 'selection',
  Header: () => null,
  Cell: SelectCoursesSelectCheckbox,
  disableSortBy: true,
};

const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const prodEnterpriseId = 'e783bb19-277f-479e-9c41-8b0ed31b4060';
const currentEpoch = Math.round((new Date()).getTime() / 1000);

const HighlightStepperSelectCourses = () => {
  const currentSelectedRowIds = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.currentSelectedRowIds,
  );
  const setState = useContextSelector(ContentHighlightsContext, v => v[1]);

  const handleSelectedRowsChanged = useCallback((selectedRowIds) => {
    setState(s => ({
      ...s,
      stepperModal: {
        ...s.stepperModal,
        currentSelectedRowIds: selectedRowIds,
      },
    }));
  }, [setState]);

  return (
    <InstantSearch
      indexName={configuration.ALGOLIA.INDEX_NAME}
      searchClient={searchClient}
    >
      <Configure
        filters={`enterprise_customer_uuids:${prodEnterpriseId} AND advertised_course_run.upgrade_deadline > ${currentEpoch}`}
        hitsPerPage={pageSize}
      />
      <HighlightStepperSelectCoursesDataTable
        selectedRowIds={currentSelectedRowIds}
        onSelectedRowsChanged={handleSelectedRowsChanged}
      />
    </InstantSearch>
  );
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

const BaseHighlightStepperSelectCoursesDataTable = ({
  selectedRowIds,
  onSelectedRowsChanged,
  isSearchStalled,
  searchResults,
}) => {
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
        pageSize,
        pageIndex: 0,
        selectedRowIds,
      }}
      pageCount={searchResultsPageCount}
      itemCount={searchResultsItemCount}
      initialTableOptions={{
        getRowId: row => row.aggregationKey,
        autoResetSelectedRows: false,
      }}
      data={tableData}
      manualSelectColumn={selectColumn}
      SelectionStatusComponent={SelectCoursesSelectionStatus}
      columns={[
        {
          Header: 'Content name',
          accessor: 'title',
        },
        {
          Header: 'Partner',
          accessor: 'partners[0].name',
        },
        {
          Header: 'Content type',
          Cell: ContentTypeTableCell,
        },
        {
          Header: 'Price',
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
          CardComponent={ContentHighlightCardItem}
        />
      )}
      {currentView === 'list' && <DataTable.Table /> }
      <DataTable.EmptyTable content="No results found" />
      <DataTable.TableFooter>
        <DataTable.RowStatus />
        <SelectCoursesSearchPagination />
      </DataTable.TableFooter>
    </DataTable>
  );
};

BaseHighlightStepperSelectCoursesDataTable.propTypes = {
  selectedRowIds: PropTypes.shape().isRequired,
  onSelectedRowsChanged: PropTypes.func.isRequired,
  isSearchStalled: PropTypes.bool.isRequired,
  searchResults: PropTypes.shape({
    hits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    nbHits: PropTypes.number.isRequired,
    nbPages: PropTypes.number.isRequired,
  }),
};

BaseHighlightStepperSelectCoursesDataTable.defaultProps = {
  searchResults: null,
};

const HighlightStepperSelectCoursesDataTable = connectStateResults(BaseHighlightStepperSelectCoursesDataTable);

export default HighlightStepperSelectCourses;
