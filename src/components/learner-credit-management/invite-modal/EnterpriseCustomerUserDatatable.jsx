import {
  DataTable, TextFilter
} from '@openedx/paragon';
import { connect } from 'react-redux';

import useEnterpriseLearnersTableData from '../data/hooks/useEnterpriseLearnersTableData';
import { formatTimestamp } from '../../../utils';
import { DEFAULT_PAGE } from '../data';
import { Button } from '@openedx/paragon'

const MemberDetailsCell = (table) => {
  return (
    <div>
      {table.row.original.user.email}
    </div>
  );
};

const MemberJoinedDateCell = ({ row }) => (
  <div>
    {formatTimestamp({ timestamp: row.original.created, format: 'MMM DD, YYYY' })}
  </div>
);

const AddMembersBulkAction = (props) => {
  console.log(props)
  const handleOnClick = () => {
    const emails = [];
    Object.keys(props.selectedFlatRows).forEach(key => {
      const { original } = props.selectedFlatRows[key];
      emails.push(original.user.email);
    })
    props.onHandleAddMembersBulkAction(emails);
  };

  return (
    <Button onClick={handleOnClick}>
      Add
    </Button>
  );
};

const RemoveMembersBulkAction = ({ selectedFlatRows, onHandleRemoveMembersBulkAction }) => {
  const handleOnClick = () => {
    const emails = [];
    Object.keys(selectedFlatRows).forEach(key => {
      const { original } = selectedFlatRows[key];
      emails.push(original.user.email);
    })
    onHandleRemoveMembersBulkAction(emails);
  };

  return (
    <Button variant='brand' onClick={handleOnClick}>
      Remove
    </Button>
  );
};

const EnterpriseCustomerUserDatatable = ({ enterpriseId, onHandleAddMembersBulkAction, onHandleRemoveMembersBulkAction }) => {
  const { isLoading, enterpriseCustomerUserTableData, fetchEnterpriseLearnersData } = useEnterpriseLearnersTableData(enterpriseId);
  return (
    <DataTable
      bulkActions={[
        <AddMembersBulkAction onHandleAddMembersBulkAction={onHandleAddMembersBulkAction} />,
        <RemoveMembersBulkAction onHandleRemoveMembersBulkAction={onHandleRemoveMembersBulkAction} />

      ]}
      columns={[
        {
          Header: 'Member details',
          accessor: 'user.email',
          Cell: MemberDetailsCell,
        },
        {
          Header: 'Joined organization',
          accessor: 'created',
          Cell: MemberJoinedDateCell,
          disableFilters: true,
        },
      ]}
      initialState={{
        pageIndex: DEFAULT_PAGE,
        filters: [],
      }}
      data={enterpriseCustomerUserTableData.results}
      defaultColumnValues={{ Filter: TextFilter }}
      fetchData={fetchEnterpriseLearnersData}
      isFilterable
      isLoading={isLoading}
      isPaginated
      isSelectable
      itemCount={enterpriseCustomerUserTableData.itemCount}
      manualFilters
      manualPagination
      pageCount={enterpriseCustomerUserTableData.pageCount}
      SelectionStatusComponent={DataTable.ControlledSelectionStatus}
    />
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EnterpriseCustomerUserDatatable);

