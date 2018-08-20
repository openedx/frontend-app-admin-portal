import React from 'react';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { Pagination, Table } from '@edx/paragon';

import TableWithPagination from './index';

const TableWithPaginationWrapper = props => (
  <MemoryRouter>
    <TableWithPagination
      columns={props.columns}
      pageCount={props.pageCount}
      data={[]}
      paginationLabel="pagination"
      formatData={data => data}
      {...props}
    />
  </MemoryRouter>
);

TableWithPaginationWrapper.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({})),
  pageCount: PropTypes.number,
  handleDataUpdate: PropTypes.func,
};

TableWithPaginationWrapper.defaultProps = {
  columns: [{
    label: 'Column 1',
    key: 'column_1',
    columnSortable: true,
  },
  {
    label: 'Column 2',
    key: 'column_2',
    columnSortable: true,
  },
  {
    label: 'Column 3',
    key: 'column_3',
  }],
  pageCount: 1,
  handleDataUpdate: () => {},
};

describe('<TableWithPagination />', () => {
  let wrapper;

  it('sets onSort in columns state correctly', () => {
    wrapper = mount((
      <TableWithPaginationWrapper />
    ));
    const { columns } = wrapper.find('TableWithPagination').instance().state;
    expect(columns[columns.length - 1].onSort).toEqual(null);
  });

  it('handles pagination correctly', () => {
    wrapper = mount((
      <TableWithPaginationWrapper
        pageCount={3}
      />
    ));

    const pagination = wrapper.find(TableWithPagination).find(Pagination);
    pagination.find('button').last().simulate('click'); // click `Next` button
    expect(wrapper.find('TableWithPagination').instance().state.currentPage).toEqual(2);

    pagination.find('button').first().simulate('click'); // click `Previous` button
    expect(wrapper.find('TableWithPagination').instance().state.currentPage).toEqual(1);
  });

  it('handles table column sort correctly', () => {
    wrapper = mount((
      <TableWithPaginationWrapper
        tableSortable
      />
    ));
    const table = wrapper.find(TableWithPagination).find(Table);
    table.find('button').first().simulate('click'); // click first column header button
    expect(wrapper.find('TableWithPagination').instance().state.ordering).toEqual('-column_1');

    table.find('button').first().simulate('click'); // click first column header button
    expect(wrapper.find('TableWithPagination').instance().state.ordering).toEqual('column_1');
  });
});
