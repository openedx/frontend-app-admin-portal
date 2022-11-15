import React, { useState, useEffect, useContext } from 'react';
import {
  DataTable, DataTableContext,
} from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform';
import { parseCourseData } from '../data/constants';
import HighlightStepperCardItemsContainer from './HighlightStepperCardItemsContainer';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
// import { setStepperHighlightSelectedRows } from '../data/actions';

/* eslint-disable */
const TrackSelections = () => {
  const {selectedFlatRows} = useContext(DataTableContext);
  const { dispatch, stepperModal: { selectedRows } } = useContext(ContentHighlightsContext);
  // ends up breaking and infinite renders here.
  useEffect(() => {
    if(selectedRows !== selectedFlatRows) {
      console.log(selectedFlatRows,selectedRows)
      //Dispatch to set selected rows here to persist data
      // dispatch(setStepperHighlightSelectedRows({selectedFlatRows}));
    }
    console.log(selectedRows)
  }, [selectedFlatRows])
  return null;
};

const HighlightStepperSelectCoursesDataTable = () => {
  const { dispatch, stepperModal: { flatRows } } = useContext(ContentHighlightsContext);
  const [currentView, setCurrentView] = useState('list');
  const [content, setContent] = useState(camelCaseObject(parseCourseData()));
  useEffect(() => {
    console.log(flatRows);
  });
  return (
    <>
      <DataTable
        dataViewToggleOptions={{
          isDataViewToggleEnabled: true,
          onDataViewToggle: val => setCurrentView(val),
          defaultActiveStateValue: 'list',
        }}
        isSelectable
        isPaginated
        itemCount={10}
        data={content}
        columns={[
          {
            Header: 'Content Name',
            accessor: 'title',
          },
          {
            Header: 'Type',
            accessor: 'contentType',
          },
          {
            Header: 'Coat Color',
            accessor: 'authoringOrganizations[0].name',
          },
        ]}
      >
        {/* Data that gets tracked on datatable actions */}
        <TrackSelections />
        <DataTable.TableControlBar />
        { currentView === 'card' && <HighlightStepperCardItemsContainer content={content} />}
        { currentView === 'list' && <DataTable.Table /> }
        <DataTable.EmptyTable content="No results found" />
        <DataTable.TableFooter />
      </DataTable>
    </>
  );
};
/* eslint-enable */
export default HighlightStepperSelectCoursesDataTable;
