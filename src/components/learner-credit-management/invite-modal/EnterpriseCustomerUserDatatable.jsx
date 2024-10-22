import React, {
  useCallback, useState, useMemo, useEffect
} from 'react';
import {
  DataTable, TextFilter
} from '@openedx/paragon';
import { connect } from 'react-redux';
import debounce from 'lodash.debounce';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';
import LmsApiService from '../../../data/services/LmsApiService';

const EnterpriseCustomerUserDatatable = ({ enterpriseId }) => {
  // const [enterpriseCustomerUserList, setEnterpriseCustomerUserList] = useState({
  //   itemCount: 0,
  //   pageCount: 0,
  //   results: [],
  // });
  const [enterpriseCustomerUserList, setEnterpriseCustomerUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchData = useCallback( async (args) => {
    // const fetch = async () => {
      try {
        setIsLoading(true);
        const options = {
          enterprise_customer: enterpriseId,
        };
        // options.page = args.currentPage + 1;
        // const options = {}
        const data = await LmsApiService.fetchEnterpriseLearnerData(options);
        const result = camelCaseObject(data);
        setEnterpriseCustomerUserList(result);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    // }
  }, [enterpriseId]);

  // const debouncedFetchData = useMemo(() => debounce(
  //   fetchData,
  //   300,
  // ), [fetchData]);
  useEffect(() => {
    fetchData();
  }, [enterpriseId, fetchData])


  return (
    <DataTable
      isPaginated
      isSelectable
      // initialState={{
      //   pageSize: 8,
      //   pageIndex: 0,
      //   sortBy: [],
      //   filters: [],
      // }}
      initialState={{
        pageSize: 10,
      }}
      isFilterable
      isSortable
      defaultColumnValues={{ Filter: TextFilter }}
      itemCount={enterpriseCustomerUserList.length}
      data={enterpriseCustomerUserList}
      columns={[
        {
          Header: 'Member details',
          accessor: 'email',
          Cell: ({ row }) => row.original.user.email,
        },
        // {
        //   Header: 'Joined organization',
        //   accessor: 'created',
        //   Cell: ({ row }) => console.log(row),
        // },
      ]}
      isLoading={isLoading}
      isExpandable
      // manualPagination
      // manualFilters
      // fetchData={fetchData}
      // pageCount={enterpriseCustomerUserList.pageCount}
    >
      <DataTable.TableControlBar />
      <DataTable.Table />
      <DataTable.EmptyTable content="No results found" />
      <DataTable.TableFooter />
    </DataTable>
  )
}
const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EnterpriseCustomerUserDatatable);

