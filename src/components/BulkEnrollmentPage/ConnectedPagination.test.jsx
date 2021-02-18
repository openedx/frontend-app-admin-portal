import React from 'react';
import { mount } from 'enzyme';
import { DataTable, DataTableContext } from '@edx/paragon';

import { BaseConnectedPagination } from './ConnectedPagination';

const algoliaProps = {
  currentRefinement: 1,
  refine: () => {},
};

const instance = {
  previousPage: () => {},
  nextPage: () => {},
  canPreviousPage: true,
  canNextPage: true,
  state: { pageIndex: 1 },
  pageCount: 3,
};

// eslint-disable-next-line react/prop-types
const PaginationWrapper = ({ value = instance, props = algoliaProps }) => (
  <DataTableContext.Provider value={value}>
    <BaseConnectedPagination {...props} />
  </DataTableContext.Provider>
);

describe('BaseConnectedPagination', () => {
  it('displays the pagination component', () => {
    const wrapper = mount(<PaginationWrapper />);
    expect(wrapper.find(DataTable.TablePagination)).toHaveLength(1);
  });
  it('calls refine when algolia and react-table page numbers do not match', () => {
    const refineSpy = jest.fn();
    const reactTablePageIndex = 2;
    mount(
      <PaginationWrapper
        value={{ ...instance, state: { pageIndex: reactTablePageIndex } }}
        props={{ ...algoliaProps, refine: refineSpy }}
      />,
    );
    expect(refineSpy).toHaveBeenCalledTimes(1);
    // algolia is 1 indexed and react-table is 0 indexed
    expect(refineSpy).toHaveBeenCalledWith(reactTablePageIndex + 1);
  });
});
